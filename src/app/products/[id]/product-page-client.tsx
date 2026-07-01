'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Star, Check, ZoomIn, Tag, Plus, Minus, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/store/layout/header'
import { AnnouncementBar } from '@/components/store/layout/announcement-bar'
import { Footer } from '@/components/store/layout/footer'
import { BackToTop } from '@/components/store/layout/back-to-top'
import { ProductReviews } from '@/components/store/product-reviews'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/lib/settings-context'
import { useCategories } from '@/hooks/use-categories'
import { useAuth } from '@/hooks/use-auth'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import { useToast } from '@/hooks/use-toast'
import type { Product } from '@/types'

interface ProductPageClientProps {
  product: Product
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { settings } = useSettings()
  const { categories } = useCategories()
  const { isAdmin, login, logout } = useAuth()
  const { handleWhatsAppCheckout } = useCartCheckout()
  const { toast } = useToast()
  const [zoom, setZoom] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const isOnSale = product.onSale && product.discountPrice != null && product.discountPrice < product.price
  const displayPrice = isOnSale ? product.discountPrice! : product.price
  const lowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      imageUrl: product.imageUrl,
    }, qty)
    setJustAdded(true)
    toast({ title: `${product.name} agregado al carrito` })
    setTimeout(() => setJustAdded(false), 1200)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const img = imgRef.current.querySelector('img') as HTMLImageElement | null
    if (img) {
      img.style.transformOrigin = `${x}% ${y}%`
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Mira este producto: ${product.name}`, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Enlace copiado al portapapeles' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header
        selectedCategory="all"
        categories={categories ?? []}
        onCategoryChange={() => {}}
        onCheckout={handleWhatsAppCheckout}
        isAdmin={isAdmin}
        onLogin={login}
        onLogout={logout}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div
              ref={imgRef}
              className="relative aspect-square bg-muted cursor-crosshair overflow-hidden rounded-2xl"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: zoom ? 'scale(1.8)' : 'scale(1)',
                }}
                priority
              />

              <div className={`absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md transition-opacity duration-200 ${zoom ? 'opacity-0' : 'opacity-100'}`}>
                <ZoomIn className="h-5 w-5 text-muted-foreground" />
              </div>

              {isOnSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white font-medium">
                  <Tag className="w-3 h-3 mr-1" />
                  Oferta
                </Badge>
              )}

              {product.featured && (
                <Badge className={`absolute top-4 left-4 ${isOnSale ? 'mt-10' : ''} bg-[var(--gold)] text-primary font-medium`}>
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  Destacado
                </Badge>
              )}

              {lowStock && (
                <Badge className={`absolute top-4 left-4 ${isOnSale || product.featured ? 'mt-20' : ''} bg-amber-500/90 text-white font-medium`}>
                  ¡Solo quedan {product.stock}!
                </Badge>
              )}
            </div>

            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit mb-3 border-primary/20">
                {product.category}
              </Badge>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-baseline gap-3 mb-6">
                {isOnSale ? (
                  <>
                    <span className="text-4xl font-bold text-red-500">
                      ${displayPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">USD</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="flex items-center gap-3 mb-6">
                {product.stock > 0 ? (
                  <>
                    <div className={`w-3 h-3 rounded-full ${lowStock ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <span className={`text-sm font-medium ${lowStock ? 'text-amber-600' : 'text-green-600'}`}>
                      {lowStock ? `¡Solo quedan ${product.stock}!` : `En Stock (${product.stock} disponibles)`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm text-destructive font-medium">Agotado</span>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{settings.shippingText}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Garantía de calidad</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Pago contra entrega</span>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-muted-foreground">Cantidad:</span>
                  <div className="flex items-center border border-border/60 rounded-full h-12">
                    <button
                      className="h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium tabular-nums">{qty}</span>
                    <button
                      className="h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className={`flex-1 h-14 text-lg rounded-full transition-all duration-200 ${
                    justAdded
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  {justAdded ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Añadir al Carrito{qty > 1 ? ` (${qty})` : ''}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full"
                  onClick={handleShare}
                  aria-label="Compartir producto"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border/50 pt-8">
            <h2 className="text-2xl font-bold mb-6">Reseñas</h2>
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
