import type { Product } from '@/types'

export interface ProductPrice {
  isOnSale: boolean
  displayPrice: number
  originalPrice: number
  discountPercent: number | null
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value)
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}

export function getDisplayPrice(product: Product): ProductPrice {
  const price = toNumber(product.price)
  const discountPrice = product.discountPrice != null ? toNumber(product.discountPrice) : null

  const isOnSale = product.onSale && discountPrice != null && discountPrice < price
  const displayPrice = isOnSale && discountPrice != null ? discountPrice : price
  const discountPercent = isOnSale ? Math.round((1 - displayPrice / price) * 100) : null

  return {
    isOnSale,
    displayPrice,
    originalPrice: price,
    discountPercent,
  }
}
