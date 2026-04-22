'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { AdminPanel } from '@/components/store/admin-panel'
import { useCartStore } from '@/store/cart'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  categoryId: string
  stock: number
  featured: boolean
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  
  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
    checkAuth()
    fetch('/api/seed')
  }, [fetchData])
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' })
      })
    } catch {
      // No hay sesión
    }
  }
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (res.ok) {
        setIsAdmin(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
  }
  
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }
  
  const handleWhatsAppCheckout = () => {
    const phoneNumber = '5354133253'
    
    const itemsList = items
      .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n')
    
    const message = `¡Hola! Estoy interesado en los siguientes productos de Bolsos Lesly:

${itemsList}

Total: $${getTotal().toFixed(2)}

¡Gracias!`
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory)
  
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'all' 
    : categories.find(c => c.id === selectedCategory)?.name || 'all'
  
  const featuredProducts = products.filter(p => p.featured)
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Bolsos Lesly</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory('all')}
                className="rounded-full"
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(category.id)}
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
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--champagne)] via-background to-[var(--champagne)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gold-light)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--gold-light)_0%,_transparent_50%)]" />
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-[var(--gold)]/30 mb-6">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-sm font-medium tracking-wide">Nueva Colección 2026</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Descubre la
                <span className="block mt-2 bg-gradient-to-r from-primary via-[var(--gold)] to-primary bg-clip-text text-transparent">
                  Elegancia Definida
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Bolsos y carteras artesanales confeccionados con los mejores materiales. 
                Cada pieza cuenta una historia de calidad y distinción.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
                  onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explorar Colección
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 border-[var(--gold)]/50 hover:bg-[var(--gold)]/10"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contáctanos
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Cuero Genuino</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Clientes Felices</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Valoración</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 mb-10">
                <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[var(--gold)]" />
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  <h3 className="text-2xl md:text-3xl font-bold">Productos Destacados</h3>
                </div>
                <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[var(--gold)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                </p>
              </div>
              <Badge variant="outline" className="px-4 py-2 text-sm border-[var(--gold)]/30">
                Envío a toda Cuba
              </Badge>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
                <p className="text-xl text-muted-foreground">No hay productos en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Admin Panel */}
        {isAdmin && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <AdminPanel onProductChange={fetchData} />
            </div>
          </section>
        )}
      </main>
      
      {/* Contact Info Section */}
      <section id="contacto" className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-3">Visítanos</h3>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">
              Te invitamos a conocer nuestra tienda y descubrir personally la calidad de nuestros productos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Dirección</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Calle 140 # 4112 / 41 y 43<br />
                  Marianao, Coco Solo<br />
                  La Habana, Cuba
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Horario</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Lunes a Sábado<br />
                  9:00 AM - 8:00 PM<br />
                  <span className="text-[var(--gold)]">Domingos con cita previa</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <Phone className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">WhatsApp</h4>
                <a 
                  href="https://wa.me/5354133253" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--gold)] hover:underline text-lg font-medium"
                >
                  +53 5 413 3253
                </a>
                <p className="text-primary-foreground/50 text-xs mt-2">
                  Respuesta inmediata
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary border-t border-primary-foreground/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg text-primary-foreground">Bolsos Lesly</span>
            </div>
            
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Bolsos Lesly. Todos los derechos reservados.
            </p>
            
            <a 
              href="https://wa.me/5354133253" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)] text-primary hover:bg-[var(--gold)]/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">Contáctanos</span>
            </a>
          </div>
        </div>
      </footer>
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
