'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product } from '@/types';
import { ProductFormData } from '@/services/product.service';

const LOCAL_STORAGE_MUTATIONS_KEY = 'product_admin_mutations_v1';

interface LocalMutationsState {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
}

interface ProductContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  saveNewProduct: (product: Product) => void;
  saveEditedProduct: (id: number, data: Partial<ProductFormData>) => void;
  markProductDeleted: (id: number) => void;
  applyLocalOverrides: (serverProducts: Product[]) => Product[];
  getLocalProductOverride: (id: number) => Partial<Product> | null;
  isDeletedLocally: (id: number) => boolean;
  resetAllLocalChanges: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [mutations, setMutations] = useState<LocalMutationsState>({
    addedProducts: [],
    updatedProducts: {},
    deletedProductIds: [],
  });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate local changes on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MUTATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMutations({
          addedProducts: parsed.addedProducts || [],
          updatedProducts: parsed.updatedProducts || {},
          deletedProductIds: parsed.deletedProductIds || [],
        });
      }
    } catch (e) {
      console.error('Failed to parse local product mutations:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to localStorage whenever mutations change (after initial hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LOCAL_STORAGE_MUTATIONS_KEY, JSON.stringify(mutations));
    }
  }, [mutations, hydrated]);

  /**
   * Save a newly created product locally
   */
  const saveNewProduct = useCallback((product: Product) => {
    const localProduct: Product = {
      ...product,
      isLocal: true,
      // If server returns duplicate ID or standard 195+, ensure unique local ID
      id: product.id || Date.now(),
    };

    setMutations((prev) => ({
      ...prev,
      addedProducts: [localProduct, ...prev.addedProducts.filter((p) => p.id !== localProduct.id)],
    }));
  }, []);

  /**
   * Save product edit locally
   */
  const saveEditedProduct = useCallback((id: number, data: Partial<ProductFormData>) => {
    setMutations((prev) => {
      // If it's a locally added product, update it directly
      const isLocalAdded = prev.addedProducts.some((p) => p.id === id);
      if (isLocalAdded) {
        return {
          ...prev,
          addedProducts: prev.addedProducts.map((p) => (p.id === id ? { ...p, ...data } : p)),
        };
      }

      // Otherwise record update overlay for server product
      return {
        ...prev,
        updatedProducts: {
          ...prev.updatedProducts,
          [id]: {
            ...(prev.updatedProducts[id] || {}),
            ...data,
          },
        },
      };
    });
  }, []);

  /**
   * Mark product as deleted locally
   */
  const markProductDeleted = useCallback((id: number) => {
    setMutations((prev) => ({
      ...prev,
      addedProducts: prev.addedProducts.filter((p) => p.id !== id),
      deletedProductIds: Array.from(new Set([...prev.deletedProductIds, id])),
    }));
  }, []);

  /**
   * Check if a product ID has been deleted locally
   */
  const isDeletedLocally = useCallback(
    (id: number) => {
      return mutations.deletedProductIds.includes(id);
    },
    [mutations.deletedProductIds]
  );

  /**
   * Get single product override
   */
  const getLocalProductOverride = useCallback(
    (id: number) => {
      // First check local added
      const added = mutations.addedProducts.find((p) => p.id === id);
      if (added) return added;

      // Check updated
      if (mutations.updatedProducts[id]) {
        return mutations.updatedProducts[id];
      }

      return null;
    },
    [mutations.addedProducts, mutations.updatedProducts]
  );

  /**
   * Apply local mutations to a list of server products:
   * 1. Remove deleted products
   * 2. Apply property updates
   */
  const applyLocalOverrides = useCallback(
    (serverProducts: Product[]): Product[] => {
      const deletedSet = new Set(mutations.deletedProductIds);

      // Filter out deleted and apply updates
      const updatedServerProducts = serverProducts
        .filter((item) => !deletedSet.has(item.id))
        .map((item) => {
          const update = mutations.updatedProducts[item.id];
          return update ? { ...item, ...update } : item;
        });

      return updatedServerProducts;
    },
    [mutations.deletedProductIds, mutations.updatedProducts]
  );

  /**
   * Reset local changes helper (useful for testing/demo)
   */
  const resetAllLocalChanges = useCallback(() => {
    setMutations({
      addedProducts: [],
      updatedProducts: {},
      deletedProductIds: [],
    });
    localStorage.removeItem(LOCAL_STORAGE_MUTATIONS_KEY);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        addedProducts: mutations.addedProducts,
        updatedProducts: mutations.updatedProducts,
        deletedProductIds: mutations.deletedProductIds,
        saveNewProduct,
        saveEditedProduct,
        markProductDeleted,
        applyLocalOverrides,
        getLocalProductOverride,
        isDeletedLocally,
        resetAllLocalChanges,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
