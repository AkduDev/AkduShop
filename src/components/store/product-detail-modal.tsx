'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, X, Star, Check, Tag, Share2, Bell } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/lib/settings-context'
import { useShare } from '@/hooks/use-share'
import { useToast } from '@/hooks/use-toast'
import { getDisplayPrice } from '@/lib/product-utils'
import type { Product } from '@/types'

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { settings } = useSettings()
  const { share } = useShare()
  const { toast } = useToast()
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSubmitted, setAlertSubmitted] = useState(false)
  const [alertLoading, setAlertLoading] = useState(false)

  if (!product) return null

  const { isOnSale, displayPrice, discountPercent } = getDisplayPrice(product)
  const lowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      imageUrl: product.imageUrl
    }, qty)
    setJustAdded(true)
  }

  const handleContinueShopping = () => {
    setJustAdded(false)
    setQty(1)
    onOpenChange(false)
  }

  const handleViewCart = () => {
    setJustAdded(false)
    setQty(1)
    onOpenChange(false)
    ;(document.querySelector('[data-cart-trigger]') as HTMLElement | null)?.click()
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.id}`
    await share(url, product.name, `Mira este producto: ${product.name}`)
  }

  const handleAlertSubmit = async () => {
    if (!alertEmail) return
    setAlertLoading(true)
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alertEmail, productId: product.id }),
      })
      if (res.ok) {
        setAlertSubmitted(true)
        toast({ title: '¡Listo!', description: 'Te notificaremos cuando esté disponible.' })
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'No se pudo registrar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setAlertLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] sm:max-h-[85vh] p-0 bg-card dark:bg-surface-1 w-[95vw] sm:w-auto pb-[env(safe-area-inset-bottom)]" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <div className="relative aspect-square md:aspect-auto md:h-full bg-muted overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover"
            />

            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1.5">
              {isOnSale && (
                <Badge className="bg-red-500 dark:bg-warm-accent text-white dark:text-warm-accent-foreground font-medium text-xs sm:text-sm w-fit">
                  <Tag className="w-3 h-3 mr-1" />
                  Oferta
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-[var(--gold)] text-primary font-medium text-xs sm:text-sm w-fit">
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  Destacado
                </Badge>
              )}
              {lowStock && (
                <Badge className="bg-amber-500/90 dark:bg-amber-600/90 text-white font-medium text-xs sm:text-sm w-fit">
                  ¡Solo quedan {product.stock}!
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full bg-background/80 backdrop-blur hover:bg-background h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-12 sm:top-4 sm:right-16 rounded-full bg-background/80 backdrop-blur hover:bg-background h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleShare}
              aria-label="Compartir producto"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 sm:p-8 flex flex-col">
            <Badge variant="outline" className="w-fit mb-2 sm:mb-3 border-primary/20 text-xs sm:text-sm">
              {product.category}
            </Badge>

            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">{product.name}</h2>

            <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
              {isOnSale ? (
                <>
                  <span className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  {discountPercent !== null && (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-warm-accent border-0 text-xs font-semibold">
                      -{discountPercent}%
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-2xl sm:text-4xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-xs sm:text-sm text-muted-foreground">USD</span>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 flex-1">
              {product.description}
            </p>

            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              {product.stock > 0 ? (
                <>
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${lowStock ? 'bg-amber-500 dark:bg-amber-400' : 'bg-green-500 dark:bg-green-400'}`} />
                    <span className={`text-xs sm:text-sm font-medium ${lowStock ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {lowStock ? `¡Solo quedan ${product.stock}!` : `En Stock (${product.stock} disponibles)`}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive" />
                  <span className="text-xs sm:text-sm text-destructive font-medium">Agotado</span>
                </>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-8">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>{settings.shippingText}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Garantía de calidad</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Pago contra entrega</span>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-muted-foreground">Cantidad:</span>
                <QuantitySelector
                  value={qty}
                  onChange={setQty}
                  min={1}
                  max={product.stock}
                />
              </div>
            )}

            {justAdded ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-medium py-2">
                  <Check className="h-5 w-5" />
                  ¡Agregado al carrito!
                </div>
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 rounded-full"
                    onClick={handleContinueShopping}
                  >
                    Seguir Comprando
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-12 rounded-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white"
                    onClick={handleViewCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ver Carrito
                  </Button>
                </div>
              </div>
            ) : isOutOfStock ? (
              <div className="space-y-3">
                {alertSubmitted ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-medium py-3 bg-green-50 dark:bg-green-950/40 rounded-xl">
                    <Bell className="h-5 w-5" />
                    Te notificaremos cuando esté disponible
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground text-center">Avísame cuando esté disponible</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Tu email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-full border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAlertSubmit()}
                      />
                      <Button
                        size="lg"
                        className="h-12 px-6 rounded-full"
                        onClick={handleAlertSubmit}
                        disabled={!alertEmail || alertLoading}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        {alertLoading ? '...' : 'Notificarme'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Añadir al Carrito{qty > 1 ? ` (${qty})` : ''}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
