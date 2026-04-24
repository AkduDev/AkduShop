export interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  _count?: { products: number }
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryFormData {
  name: string
  description: string
}
