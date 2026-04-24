export interface PaginationData {
  page?: number
  limit?: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ProductsResponse {
  products: any[]
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
