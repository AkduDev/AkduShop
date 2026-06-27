'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/store/layout/header'
import { AnnouncementBar } from '@/components/store/layout/announcement-bar'
import { HeroSection } from '@/components/store/layout/hero-section'
import { FeaturedProducts } from '@/components/store/featured-products'
import { SalesSection } from '@/components/store/sales-section'
import { ProductsSection } from '@/components/store/products-section'
import { ContactSection } from '@/components/store/layout/contact-section'
import { Footer } from '@/components/store/layout/footer'
import { BackToTop } from '@/components/store/layout/back-to-top'
import { ProductDetailModal } from '@/components/store/product-detail-modal'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import type { Product } from '@/types'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const { isAdmin, login, logout } = useAuth()
  const { products, loading, pagination, fetchProducts } = useProducts({
    category: selectedCategory,
    search: searchQuery || undefined,
  })
  const { products: featuredProducts } = useProducts({ featured: true, limit: 50 })
  const { products: saleProducts } = useProducts({ onSale: true, limit: 50 })
  const { categories } = useCategories()
  const { handleWhatsAppCheckout } = useCartCheckout()

  const defaultPagination = { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(page)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
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
        <HeroSection />

        {selectedCategory === 'all' && !searchQuery && (
          <FeaturedProducts
            products={featuredProducts}
            onViewDetails={handleViewDetails}
          />
        )}

        {selectedCategory === 'all' && !searchQuery && saleProducts.length > 0 && (
          <SalesSection
            products={saleProducts}
            onViewDetails={handleViewDetails}
          />
        )}

        <ProductsSection
          products={products ?? []}
          loading={loading}
          pagination={pagination ?? defaultPagination}
          categories={categories ?? []}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          searchQuery={searchQuery}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onViewDetails={handleViewDetails}
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
