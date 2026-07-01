'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ShoppingBag, ArrowUpDown, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/store/product-card'
import { Pagination } from '@/components/store/pagination'
import { ProductCardSkeleton } from '@/components/ui/skeletons/product-card-skeleton'
import { useSettings } from '@/lib/settings-context'
import type { Product, Category, PaginationData } from '@/types'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'newest' | 'featured'

interface ProductsSectionProps {
  products: Product[]
  loading: boolean
  pagination: PaginationData
  categories: Category[]
  selectedCategory: string
  currentPage: number
  searchQuery: string
  sortBy: SortOption
  priceRange: string
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onSortByChange: (sort: SortOption) => void
  onPriceRangeChange: (range: string) => void
  onViewDetails: (product: Product) => void
  infinite?: boolean
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function ProductsSection({
  products,
  loading,
  pagination,
  categories,
  selectedCategory,
  currentPage,
  searchQuery,
  sortBy,
  priceRange,
  onPageChange,
  onSearch,
  onSortByChange,
  onPriceRangeChange,
  onViewDetails,
  infinite = false,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
}: ProductsSectionProps) {
  const { settings } = useSettings()
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleLoadMore = useCallback(() => {
    if (fetchNextPage && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    if (!infinite || !sentinelRef.current) return
    const sentinel = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [infinite, handleLoadMore])

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(value)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const selectedCategoryName = selectedCategory === 'all'
    ? 'all'
    : categories.find(c => c.id === selectedCategory)?.name || 'all'

  return (
    <section id="productos" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {selectedCategoryName === 'all' ? 'Toda la Colección' : selectedCategoryName}
            </h3>
            <p className="text-muted-foreground mt-1">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'}
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
              aria-label={settings.searchPlaceholder}
              placeholder={settings.searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
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
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearch('') }}
                aria-label="Limpiar búsqueda"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortOption)}
                className="text-sm bg-background border border-border/50 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                aria-label="Ordenar por"
              >
                <option value="default">Predeterminado</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="newest">Más recientes</option>
                <option value="featured">Destacados</option>
              </select>
            </div>
            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              className="text-sm bg-background border border-border/50 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              aria-label="Filtrar por precio"
            >
              <option value="all">Todos los precios</option>
              <option value="0-10">Hasta $10</option>
              <option value="10-25">$10 - $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100+">Más de $100</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">
              {searchQuery ? `${settings.noSearchResultsText} "${searchQuery}"` : settings.noProductsText}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewDetails}
                  variant="default"
                />
              ))}
            </div>
            {infinite ? (
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Cargando más productos...</span>
                  </div>
                )}
                {!hasNextPage && products.length > 0 && (
                  <p className="text-sm text-muted-foreground">No hay más productos</p>
                )}
              </div>
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
