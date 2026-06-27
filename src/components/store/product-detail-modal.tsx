'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ShoppingCart, X, Star, Check, ZoomIn, Tag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/lib/settings-context'

interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number | null
  imageUrl: string
  category: string
  categoryId: string
  stock: number
  featured: boolean
  onSale: boolean
}

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { settings } = useSettings()
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const imgRef = useRef<HTMLDivElement>(null)

  if (!product) return null

  const isOnSale = product.onSale && product.discountPrice != null && product.discountPrice < product.price
  const displayPrice = isOnSale ? product.discountPrice! : product.price

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      imageUrl: product.imageUrl
    })
    onOpenChange(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
  }

  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] sm:max-h-[85vh] p-0 bg-card w-[90vw] sm:w-auto" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <div
            ref={imgRef}
            className="relative aspect-square md:aspect-auto md:h-full bg-muted cursor-crosshair overflow-hidden"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-200 ease-out"
              style={{
                transform: zoom ? 'scale(1.8)' : 'scale(1)',
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            />

            <div className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md transition-opacity duration-200 ${zoom ? 'opacity-0' : 'opacity-100'}`}>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            {isOnSale && (
              <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white font-medium text-xs sm:text-sm">
                <Tag className="w-3 h-3 mr-1" />
                Oferta
              </Badge>
            )}

            {product.featured && (
              <Badge className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${isOnSale ? 'mt-6 sm:mt-10' : ''} bg-[var(--gold)] text-primary font-medium text-xs sm:text-sm`}>
                <Star className="w-3 h-3 mr-1 fill-primary" />
                Destacado
              </Badge>
            )}

            {lowStock && (
              <Badge className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${isOnSale || product.featured ? 'mt-12 sm:mt-20' : ''} bg-amber-500/90 text-white font-medium text-xs sm:text-sm`}>
                ¡Solo quedan {product.stock}!
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full bg-background/80 backdrop-blur hover:bg-background h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
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
                  <span className="text-2xl sm:text-4xl font-bold text-red-500">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
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
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${lowStock ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${lowStock ? 'text-amber-600' : 'text-green-600'}`}>
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

            <Button
              size="lg"
              className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Añadir al Carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
