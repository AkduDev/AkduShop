'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '@/components/store/product-card'
import { ProductCardSkeleton } from '@/components/ui/skeletons/product-card-skeleton'
import type { Product } from '@/types'

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

async function fetchRelated(categoryId: string, currentProductId: string): Promise<Product[]> {
  const res = await fetch(`/api/products?categoryId=${categoryId}&limit=4`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.products ?? []).filter((p: Product) => p.id !== currentProductId).slice(0, 4)
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related', categoryId, currentProductId],
    queryFn: () => fetchRelated(categoryId, currentProductId),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="default"
        />
      ))}
    </div>
  )
}
