export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string;
}

export interface LoginResponse extends User {
  token: string;
  refreshToken?: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: Review[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images?: string[];
  isLocal?: boolean; // Flag to identify locally created products
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryItem {
  slug: string;
  name: string;
  url: string;
}

export type Category = string | CategoryItem;

export type SortField = 'price' | 'rating' | 'title' | 'id';
export type SortOrder = 'asc' | 'desc';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  sortBy?: SortField;
  order?: SortOrder;
}
