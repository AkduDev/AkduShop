'use client'

import { Tag, Zap, Flame } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import { AnimateOnScroll } from '@/components/store/animate-on-scroll'
import type { Product } from '@/types'

interface SalesSectionProps {
  products: Product[]
  onViewDetails: (product: Product) => void
}

export function SalesSection({ products, onViewDetails }: SalesSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-b from-red-500/5 via-transparent to-transparent">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent via-red-500/30 to-red-500/60" />
              <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500">
                  Ofertas Imperdibles
                </h3>
                <Zap className="h-5 w-5 text-red-500" />
              </div>
              <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent via-red-500/30 to-red-500/60" />
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {products.slice(0, 8).map((product, index) => (
            <AnimateOnScroll key={product.id} delay={index * 100}>
              <ProductCard
                product={product}
                onViewDetails={onViewDetails}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
