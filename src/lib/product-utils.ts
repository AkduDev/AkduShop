import type { Product } from '@/types'

export interface ProductPrice {
  isOnSale: boolean
  displayPrice: number
  originalPrice: number
  discountPercent: number | null
}

export function getDisplayPrice(product: Product): ProductPrice {
  const isOnSale = product.onSale && product.discountPrice != null && product.discountPrice < product.price
  const displayPrice = isOnSale ? product.discountPrice! : product.price
  const discountPercent = isOnSale ? Math.round((1 - displayPrice / product.price) * 100) : null

  return {
    isOnSale,
    displayPrice,
    originalPrice: product.price,
    discountPercent,
  }
}
