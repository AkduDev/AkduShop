export interface PaginationData {
  page?: number
  limit?: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

import type { Product } from './product'

export interface ProductsResponse {
  products: Product[]
  pagination: PaginationData
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalStock: number
  lowStockProducts: number
  featuredProducts: number
  inventoryValue: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface UploadResponse {
  url: string
  fileName: string
  size: number
}
