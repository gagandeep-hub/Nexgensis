import apiClient from '@/lib/axios';
import { Product, ProductsResponse, CategoryItem, SortField, SortOrder } from '@/types';

export interface FetchProductsOptions {
  limit?: number;
  skip?: number;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number;
  signal?: AbortSignal;
}

export interface SearchProductsOptions extends FetchProductsOptions {
  q: string;
}

export interface CategoryProductsOptions extends FetchProductsOptions {
  category: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
  thumbnail?: string;
  brand?: string;
}

export const productService = {
  /**
   * Fetch standard paginated products with optional sorting
   */
  async getProducts(options: FetchProductsOptions = {}): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, sortBy, order, delay, signal } = options;
    const params: Record<string, string | number> = { limit, skip };

    if (sortBy && sortBy !== 'id') {
      params.sortBy = sortBy;
      params.order = order || 'asc';
    }

    if (typeof delay === 'number' && delay > 0) {
      params.delay = delay;
    }

    const response = await apiClient.get<ProductsResponse>('/products', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Search products by query string
   */
  async searchProducts(options: SearchProductsOptions): Promise<ProductsResponse> {
    const { q, limit = 10, skip = 0, sortBy, order, delay, signal } = options;
    const params: Record<string, string | number> = {
      q,
      limit,
      skip,
    };

    if (sortBy && sortBy !== 'id') {
      params.sortBy = sortBy;
      params.order = order || 'asc';
    }

    if (typeof delay === 'number' && delay > 0) {
      params.delay = delay;
    }

    const response = await apiClient.get<ProductsResponse>('/products/search', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Get products filtered by category
   */
  async getProductsByCategory(options: CategoryProductsOptions): Promise<ProductsResponse> {
    const { category, limit = 10, skip = 0, sortBy, order, delay, signal } = options;
    const params: Record<string, string | number> = { limit, skip };

    if (sortBy && sortBy !== 'id') {
      params.sortBy = sortBy;
      params.order = order || 'asc';
    }

    if (typeof delay === 'number' && delay > 0) {
      params.delay = delay;
    }

    const encodedCategory = encodeURIComponent(category);
    const response = await apiClient.get<ProductsResponse>(`/products/category/${encodedCategory}`, {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Get all product categories
   */
  async getCategories(signal?: AbortSignal): Promise<CategoryItem[]> {
    const response = await apiClient.get<Array<string | CategoryItem>>('/products/categories', {
      signal,
    });

    // Normalize DummyJSON categories which can be strings or {slug, name, url} objects
    return response.data.map((item) => {
      if (typeof item === 'string') {
        return {
          slug: item,
          name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '),
          url: `/products/category/${item}`,
        };
      }
      return item;
    });
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: number | string, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Add a new product via DummyJSON API (simulated)
   */
  async addProduct(product: ProductFormData): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', {
      ...product,
      thumbnail: product.thumbnail || 'https://dummyjson.com/image/200x200?text=' + encodeURIComponent(product.title),
      rating: product.rating ?? 4.5,
    });
    return response.data;
  },

  /**
   * Edit an existing product via DummyJSON API (simulated)
   */
  async updateProduct(id: number, product: Partial<ProductFormData>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  /**
   * Delete a product via DummyJSON API (simulated)
   */
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
    const response = await apiClient.delete<{ id: number; isDeleted: boolean }>(`/products/${id}`);
    return response.data;
  },
};
