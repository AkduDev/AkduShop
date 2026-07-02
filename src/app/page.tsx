'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/store/layout/header'
import { AnnouncementBar } from '@/components/store/layout/announcement-bar'
import { HeroSection } from '@/components/store/layout/hero-section'
import { TrustBanner } from '@/components/store/trust-banner'
import { FeaturedProducts } from '@/components/store/featured-products'
import { SalesSection } from '@/components/store/sales-section'
import { ProductsSection } from '@/components/store/products-section'
import { ContactSection } from '@/components/store/layout/contact-section'
import { Footer } from '@/components/store/layout/footer'
import { BackToTop } from '@/components/store/layout/back-to-top'
import { ProductCardSkeleton } from '@/components/ui/skeletons/product-card-skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import type { Product } from '@/types'

const ProductDetailModal = dynamic(
  () => import('@/components/store/product-detail-modal').then((m) => m.ProductDetailModal),
  { ssr: false }
)

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('cat') || 'all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'default')
  const [priceRange, setPriceRange] = useState<string>(searchParams.get('price') || 'all')

  const { isAdmin, login, logout } = useAuth()
  const { products, loading, pagination, fetchProducts, fetchNextPage, hasNextPage, isFetchingNextPage } = useProducts({
    category: selectedCategory,
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
    priceRange: priceRange !== 'all' ? priceRange : undefined,
    infinite: true,
  })
  const { products: featuredProducts, loading: featuredLoading } = useProducts({ featured: true, limit: 5 })
  const { products: saleProducts, loading: saleLoading } = useProducts({ onSale: true, limit: 8 })
  const { categories } = useCategories()
  const cartCheckout = useCartCheckout()
  const handleWhatsAppCheckout = useCallback(() => cartCheckout.handleWhatsAppCheckout(), [cartCheckout.handleWhatsAppCheckout])

  const defaultPagination = { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }

  const updateURL = useCallback((cat: string, q: string, page: number, sort: string, price: string) => {
    const params = new URLSearchParams()
    if (cat && cat !== 'all') params.set('cat', cat)
    if (q) params.set('q', q)
    if (page > 1) params.set('page', String(page))
    if (sort && sort !== 'default') params.set('sort', sort)
    if (price && price !== 'all') params.set('price', price)
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '/', { scroll: false })
  }, [router])

  useEffect(() => {
    setCurrentPage(1)
    updateURL(selectedCategory, searchQuery, 1, sortBy, priceRange)
  }, [selectedCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(page)
    updateURL(selectedCategory, searchQuery, page, sortBy, priceRange)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    updateURL(selectedCategory, query, 1, sortBy, priceRange)
  }

  const handleSortByChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
    updateURL(selectedCategory, searchQuery, 1, sort, priceRange)
  }

  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range)
    setCurrentPage(1)
    updateURL(selectedCategory, searchQuery, 1, sortBy, range)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />

      <Header
        selectedCategory={selectedCategory}
        categories={categories ?? []}
        onCategoryChange={handleCategoryChange}
        onCheckout={handleWhatsAppCheckout}
        isAdmin={isAdmin}
        onLogin={login}
        onLogout={logout}
      />

      <main className="flex-1">
        <HeroSection heroProduct={featuredProducts?.[0] || null} />

        <TrustBanner />

        {selectedCategory === 'all' && !searchQuery && (
          featuredLoading && featuredProducts.length === 0 ? (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {[...Array(5)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <FeaturedProducts
              products={featuredProducts}
              onViewDetails={handleViewDetails}
            />
          )
        )}

        {selectedCategory === 'all' && !searchQuery && (
          saleLoading && saleProducts.length === 0 ? (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="flex justify-center mb-8">
                  <div className="h-10 w-64 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {[...Array(4)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </section>
          ) : saleProducts.length > 0 ? (
            <SalesSection
              products={saleProducts}
              onViewDetails={handleViewDetails}
            />
          ) : null
        )}

        <ProductsSection
          products={products ?? []}
          loading={loading}
          pagination={pagination ?? defaultPagination}
          categories={categories ?? []}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          searchQuery={searchQuery}
          sortBy={sortBy as 'default' | 'price-asc' | 'price-desc' | 'newest' | 'featured'}
          priceRange={priceRange}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSortByChange={handleSortByChange}
          onPriceRangeChange={handlePriceRangeChange}
          onViewDetails={handleViewDetails}
          infinite
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </main>

      <ContactSection />
      <Footer />

      <BackToTop />

      <ProductDetailModal
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
