export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  categoryId: string
  stock: number
  featured: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductFormData {
  name: string
  description: string
  price: string
  imageUrl: string
  categoryId: string
  stock: string
  featured: boolean
}

export interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
}

export interface ProductGridProps {
  products: Product[]
  loading: boolean
  onViewDetails: (product: Product) => void
}
