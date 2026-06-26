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

  const { isAdmin, login, logout } = useAuth()
  const { products, loading, pagination, fetchProducts } = useProducts({ category: selectedCategory })
  const { categories, fetchCategories } = useCategories()
  const { handleWhatsAppCheckout } = useCartCheckout()

  const defaultPagination = { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }
  const featuredProducts = products?.filter(p => p.featured) ?? []
  const saleProducts = products?.filter(p => p.onSale && p.stock > 0) ?? []

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    Promise.all([
      fetchProducts(1),
      fetchCategories()
    ])
  }, [selectedCategory, fetchProducts, fetchCategories])

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

        {selectedCategory === 'all' && (
          <FeaturedProducts
            products={featuredProducts}
            onViewDetails={handleViewDetails}
          />
        )}

        {selectedCategory === 'all' && saleProducts.length > 0 && (
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
          onPageChange={handlePageChange}
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
