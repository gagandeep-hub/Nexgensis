'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product, SortField, SortOrder } from '@/types';
import { productService } from '@/services/product.service';
import { useProductContext } from '@/context/ProductContext';

export interface UseProductsResult {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy: SortField;
  order: SortOrder;
  totalPages: number;
  setSearch: (query: string) => void;
  setCategory: (category: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSorting: (sortBy: SortField, order: SortOrder) => void;
  clearFilters: () => void;
  retry: () => void;
}

export function useProducts(): UseProductsResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { applyLocalOverrides, addedProducts } = useProductContext();

  // Safely parse and sanitize URL parameters
  const page = useMemo(() => {
    const raw = searchParams.get('page');
    const parsed = parseInt(raw || '1', 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  const limit = useMemo(() => {
    const raw = searchParams.get('limit');
    const parsed = parseInt(raw || '10', 10);
    return [10, 20, 50].includes(parsed) ? parsed : 10;
  }, [searchParams]);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = (searchParams.get('sortBy') as SortField) || 'id';
  const order = (searchParams.get('order') as SortOrder) || 'asc';

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Request sequencing and abort controller references to eliminate race conditions
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Helper to update URL search parameters while preserving clean state
   */
  const updateParams = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (key === 'page' && value === 1)) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    },
    [router, pathname, searchParams]
  );

  /**
   * Fetch products from DummyJSON API with full race condition protection
   */
  const fetchProducts = useCallback(async () => {
    // 1. Cancel previous pending request if still active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Increment request sequence token
    const currentRequestId = ++activeRequestIdRef.current;

    setLoading(true);
    setError(null);

    const skip = (page - 1) * limit;

    try {
      let responseProducts: Product[] = [];
      let calculatedTotal = 0;

      // Handle category + search conflict scenario
      if (category && q.trim()) {
        // DummyJSON does not support simultaneous category and query filter.
        // Solution: Fetch all products in the category (limit=0), then filter and paginate client-side.
        const res = await productService.getProductsByCategory({
          category,
          limit: 0,
          skip: 0,
          signal: controller.signal,
        });

        // Filter by search query locally
        const queryLower = q.trim().toLowerCase();
        let filtered = res.products.filter(
          (p) =>
            p.title.toLowerCase().includes(queryLower) ||
            p.description.toLowerCase().includes(queryLower) ||
            (p.brand && p.brand.toLowerCase().includes(queryLower))
        );

        // Apply sorting
        if (sortBy && sortBy !== 'id') {
          filtered.sort((a, b) => {
            const valA = a[sortBy] ?? '';
            const valB = b[sortBy] ?? '';
            if (typeof valA === 'number' && typeof valB === 'number') {
              return order === 'desc' ? valB - valA : valA - valB;
            }
            return order === 'desc'
              ? String(valB).localeCompare(String(valA))
              : String(valA).localeCompare(String(valB));
          });
        }

        calculatedTotal = filtered.length;
        responseProducts = filtered.slice(skip, skip + limit);
      } else if (q.trim()) {
        // Pure search
        const res = await productService.searchProducts({
          q: q.trim(),
          limit,
          skip,
          sortBy,
          order,
          signal: controller.signal,
        });
        responseProducts = res.products;
        calculatedTotal = res.total;
      } else if (category) {
        // Pure category filter
        const res = await productService.getProductsByCategory({
          category,
          limit,
          skip,
          sortBy,
          order,
          signal: controller.signal,
        });
        responseProducts = res.products;
        calculatedTotal = res.total;
      } else {
        // Standard paginated listing
        const res = await productService.getProducts({
          limit,
          skip,
          sortBy,
          order,
          signal: controller.signal,
        });
        responseProducts = res.products;
        calculatedTotal = res.total;
      }

      // Check if this request is still the newest one
      if (currentRequestId === activeRequestIdRef.current) {
        setRawProducts(responseProducts);
        setTotalCount(calculatedTotal);
        setLoading(false);
      }
    } catch (err: unknown) {
      // Ignore AbortError caused by rapid user typing
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (currentRequestId === activeRequestIdRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setLoading(false);
      }
    }
  }, [page, limit, q, category, sortBy, order]);

  // Trigger fetch whenever parameters change
  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  /**
   * Merge raw server products with locally stored additions, updates, and deletions
   */
  const displayedProducts = useMemo(() => {
    // Apply updates and remove deletions
    const merged = applyLocalOverrides(rawProducts);

    // If on page 1 and no search query, prepend locally added products that match category
    if (page === 1) {
      const filteredAdded = addedProducts.filter((p) => {
        if (category && p.category !== category) return false;
        if (q.trim()) {
          const matchTitle = p.title.toLowerCase().includes(q.trim().toLowerCase());
          const matchDesc = p.description.toLowerCase().includes(q.trim().toLowerCase());
          return matchTitle || matchDesc;
        }
        return true;
      });

      // Avoid duplicates if already in list
      const existingIds = new Set(merged.map((m) => m.id));
      const newItems = filteredAdded.filter((p) => !existingIds.has(p.id));
      return [...newItems, ...merged];
    }

    return merged;
  }, [rawProducts, applyLocalOverrides, addedProducts, page, category, q]);

  // Adjust total count for locally added items
  const adjustedTotal = useMemo(() => {
    const extra = addedProducts.length;
    return totalCount + (page === 1 ? extra : 0);
  }, [totalCount, addedProducts.length, page]);

  const totalPages = Math.max(1, Math.ceil(adjustedTotal / limit));

  // Handler functions for controls
  const setSearch = useCallback(
    (query: string) => {
      // Reset to page 1 when search changes as required
      updateParams({ q: query, page: 1 });
    },
    [updateParams]
  );

  const setCategory = useCallback(
    (newCat: string) => {
      // Reset to page 1 when category changes
      updateParams({ category: newCat, page: 1 });
    },
    [updateParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage });
    },
    [updateParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      updateParams({ limit: newLimit, page: 1 });
    },
    [updateParams]
  );

  const setSorting = useCallback(
    (newSortBy: SortField, newOrder: SortOrder) => {
      updateParams({ sortBy: newSortBy, order: newOrder, page: 1 });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    updateParams({ q: '', category: '', sortBy: 'id', order: 'asc', page: 1 });
  }, [updateParams]);

  return {
    products: displayedProducts,
    total: adjustedTotal,
    loading,
    error,
    page,
    limit,
    q,
    category,
    sortBy,
    order,
    totalPages,
    setSearch,
    setCategory,
    setPage,
    setLimit,
    setSorting,
    clearFilters,
    retry: fetchProducts,
  };
}
