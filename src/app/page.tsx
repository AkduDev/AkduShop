'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  Instagram, 
  Menu,
  X,
  Sparkles,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/store/product-card'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ProductDetailModal } from '@/components/store/product-detail-modal'
import { AdminLogin } from '@/components/store/admin-login'
import { AdminPanel } from '@/components/store/admin-panel'
import { useCartStore } from '@/store/cart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
  featured: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(data.map((p: Product) => p.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchProducts()
    checkAuth()
    
    // Inicializar base de datos
    fetch('/api/seed')
  }, [fetchProducts])
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' })
      })
      // Si hay una sesión válida, el servidor la mantendrá
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
    : products.filter(p => p.category === selectedCategory)
  
  const featuredProducts = products.filter(p => p.featured)
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Bolsos Lesly</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Estilo y Elegancia</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory('all')}
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
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
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all')
                    setMobileMenuOpen(false)
                  }}
                >
                  Todos
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 md:p-12">
            <div className="relative z-10 max-w-2xl">
              <Badge className="mb-4 bg-amber-500 hover:bg-amber-600">
                <Sparkles className="w-3 h-3 mr-1" />
                Nueva Colección
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Descubre tu Estilo Perfecto
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Bolsos y carteras artesanales con la mejor calidad. 
                Encuentra el complemento perfecto para cada ocasión.
              </p>
              <Button size="lg" onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Productos
              </Button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/20 to-transparent" />
          </div>
        </section>
        
        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-5 w-5 text-rose-500" />
              <h3 className="text-2xl font-bold">Productos Destacados</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Products Grid */}
        <section id="productos">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'Todos los Productos' : selectedCategory}
            </h3>
            <Badge variant="secondary">
              {filteredProducts.length} productos
            </Badge>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay productos en esta categoría</p>
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
        </section>
        
        {/* Admin Panel */}
        {isAdmin && (
          <AdminPanel onProductChange={fetchProducts} />
        )}
      </main>
      
      {/* Contact Info Section */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Contáctanos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Dirección</h4>
                <p className="text-sm text-muted-foreground">
                  Calle 140 # 4112 / 41 y 43<br />
                  Marianao, Coco Solo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Horario</h4>
                <p className="text-sm text-muted-foreground">
                  Lunes a Sábado<br />
                  9:00 AM - 8:00 PM
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">WhatsApp</h4>
                <a 
                  href="https://wa.me/5354133253" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  +53 5 413 3253
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="font-bold text-lg">Bolsos Lesly</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              © {new Date().getFullYear()} Bolsos Lesly. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/5354133253" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
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
