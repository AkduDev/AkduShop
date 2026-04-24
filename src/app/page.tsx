'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  Menu,
  X,
  Sparkles,
  Heart,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/store/product-card'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ProductDetailModal } from '@/components/store/product-detail-modal'
import { AdminLogin } from '@/components/store/admin-login'
import { AdminPanel } from '@/components/store/admin-panel-refactored'
import { Pagination } from '@/components/store/pagination'
import { useCartStore } from '@/store/cart'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import { Product, Category } from '@/types'
import { HeroSection } from '@/components/store/layout/hero-section'
import { ContactSection } from '@/components/store/layout/contact-section'
import { Footer } from '@/components/store/layout/footer'
import { ProductCardSkeleton } from '@/components/ui/skeletons/product-card-skeleton'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Hooks personalizados
  const { isAdmin, checkAuth, login, logout } = useAuth()
  const { products, loading, pagination, fetchProducts } = useProducts(selectedCategory)
  const { categories, fetchCategories } = useCategories()
  const { handleWhatsAppCheckout } = useCartCheckout()
  
  // Zustand store
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  
   useEffect(() => {
     const initializeApp = async () => {
       setCurrentPage(1)
       await Promise.all([
         fetchProducts(1),
         fetchCategories(),
         checkAuth()
       ])
     }
     
     initializeApp()
   }, [selectedCategory, fetchProducts, fetchCategories, checkAuth])
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    return await login(email, password)
  }
  
  const handleLogout = async () => {
    await logout()
  }
  
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }
  
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'all' 
    : categories.find(c => c.id === selectedCategory)?.name || 'all'
  
  const featuredProducts = products.filter(p => p.featured)
  
  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  })
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(page)
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-profesional.jpg" 
                alt="Carteras Lesly" 
                width={180}
                height={60}
                className="h-12 w-auto object-contain logo-transparent"
                priority
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => {
                  setSelectedCategory('all')
                  setCurrentPage(1)
                }}
                className="rounded-full"
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setCurrentPage(1)
                  }}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <CartDrawer onCheckout={handleWhatsAppCheckout} />
              <AdminLogin isAdmin={isAdmin} onLogin={handleLogin} onLogout={handleLogout} />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setSelectedCategory('all')
                    setCurrentPage(1)
                    setMobileMenuOpen(false)
                  }}
                >
                  Todos
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 mb-10">
                <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[var(--gold)]" />
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  <h3 className="text-2xl md:text-3xl font-bold">Carteras Destacadas</h3>
                </div>
                <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[var(--gold)]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {featuredProducts.slice(0, 4).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Products Grid */}
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
              <Badge variant="outline" className="px-4 py-2 text-sm border-[var(--gold)]/30">
                Envío a toda Cuba
              </Badge>
            </div>
            
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Buscar carteras..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-3 pl-12 rounded-full border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all"
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
                <p className="text-xl text-muted-foreground">
                  {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'No hay carteras en esta categoría'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </section>
        
        {/* Admin Panel */}
        {isAdmin && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <AdminPanel onProductChange={() => fetchProducts(currentPage)} />
            </div>
          </section>
        )}
      </main>
      
      {/* Contact Info Section */}
      <ContactSection />
      
      {/* Footer */}
      <Footer />
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
