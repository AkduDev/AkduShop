'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/store/product-card'
import { Pagination } from '@/components/store/pagination'
import { ProductCardSkeleton } from '@/components/ui/skeletons/product-card-skeleton'
import { useSettings } from '@/lib/settings-context'
import type { Product, Category, PaginationData } from '@/types'

interface ProductsSectionProps {
  products: Product[]
  loading: boolean
  pagination: PaginationData
  categories: Category[]
  selectedCategory: string
  currentPage: number
  onPageChange: (page: number) => void
  onViewDetails: (product: Product) => void
}

export function ProductsSection({
  products,
  loading,
  pagination,
  categories,
  selectedCategory,
  currentPage,
  onPageChange,
  onViewDetails
}: ProductsSectionProps) {
  const { settings } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')

  const selectedCategoryName = selectedCategory === 'all'
    ? 'all'
    : categories.find(c => c.id === selectedCategory)?.name || 'all'

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  })

  return (
    <section id="productos" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {selectedCategoryName === 'all' ? 'Toda la Colección' : selectedCategoryName}
            </h3>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-2 text-sm border-primary/20">
            {settings.shippingText}
          </Badge>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder={settings.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              className="w-full px-4 py-3 pl-12 rounded-full border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">
              {searchQuery ? `${settings.noSearchResultsText} "${searchQuery}"` : settings.noProductsText}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewDetails}
                  variant="featured"
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </section>
  )
}
