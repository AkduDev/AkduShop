'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Star, Check, Tag, Share2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { Header } from '@/components/store/layout/header'
import { AnnouncementBar } from '@/components/store/layout/announcement-bar'
import { Footer } from '@/components/store/layout/footer'
import { BackToTop } from '@/components/store/layout/back-to-top'
import { ProductReviews } from '@/components/store/product-reviews'
import { RelatedProducts } from '@/components/store/related-products'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/lib/settings-context'
import { useCategories } from '@/hooks/use-categories'
import { useAuth } from '@/hooks/use-auth'
import { useCartCheckout } from '@/hooks/use-cart-checkout'
import { useToast } from '@/hooks/use-toast'
import { useShare } from '@/hooks/use-share'
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
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)
  const addedTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    if (!ctaRef.current || product.stock <= 0) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(ctaRef.current)
    return () => observer.disconnect()
  }, [product.stock])

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
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 1200)
  }

  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }
  }, [])

  const { share } = useShare()

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.id}`
    const result = await share(url, product.name, `Mira este producto: ${product.name}`)
    if (result) toast({ title: 'Enlace copiado al portapapeles' })
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

      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              </li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link href={`/?cat=${product.categoryId}`} className="hover:text-foreground transition-colors">
                  {product.category}
                </Link>
              </li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative aspect-square bg-muted overflow-hidden rounded-2xl">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover"
                priority
              />

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
                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                      ${displayPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-sm font-semibold">
                      -{Math.round((1 - displayPrice / product.price) * 100)}%
                    </Badge>
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
                    <span className={`text-sm font-medium ${lowStock ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
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
                  <QuantitySelector
                    value={qty}
                    onChange={setQty}
                    min={1}
                    max={product.stock}
                    size="lg"
                  />
                </div>
              )}

              <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
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

          <div className="mt-12 border-t border-border/50 pt-8">
            <h2 className="text-2xl font-bold mb-6">También te puede gustar</h2>
            <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />

      {product.stock > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border p-3 z-40 transition-transform duration-300 ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center gap-3">
            <QuantitySelector
              value={qty}
              onChange={setQty}
              min={1}
              max={product.stock}
              size="sm"
            />
            <Button
              size="lg"
              className={`flex-1 h-10 rounded-full text-sm ${
                justAdded
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar{qty > 1 ? ` (${qty})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
