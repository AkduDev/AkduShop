'use client'

import { memo } from 'react'
import { Heart } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import { useSettings } from '@/lib/settings-context'
import type { Product } from '@/types'

interface FeaturedProductsProps {
  products: Product[]
  onViewDetails: (product: Product) => void
}

export const FeaturedProducts = memo(function FeaturedProducts({ products, onViewDetails }: FeaturedProductsProps) {
  const { settings } = useSettings()

  if (products.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent via-primary/30 to-primary/60" />
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400 animate-pulse" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {settings.featuredTitle}
            </h3>
          </div>
          <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent via-primary/30 to-primary/60" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {products.slice(0, 5).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              variant="featured"
            />
          ))}
        </div>
      </div>
    </section>
  )
})
