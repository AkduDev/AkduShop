'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Eye, Star, Plus, Minus, Check, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'

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

interface ProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
  variant?: 'default' | 'featured'
}

export function ProductCard({ product, onViewDetails, variant = 'default' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const isFeatured = variant === 'featured'
  const [qty, setQty] = useState(0)
  const [justAdded, setJustAdded] = useState(false)

  const lowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = () => {
    const addQty = qty > 0 ? qty : 1
    const priceToAdd = product.onSale && product.discountPrice != null ? product.discountPrice : product.price
    for (let i = 0; i < addQty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: priceToAdd,
        imageUrl: product.imageUrl
      })
    }
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
    setQty(0)
  }

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className={`relative overflow-hidden bg-muted ${isFeatured ? 'aspect-[3/4]' : 'aspect-square'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5">
            {product.onSale && (
              <Badge className="bg-red-500/90 text-white border-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 shadow-md backdrop-blur-sm w-fit">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 fill-current" />
                Oferta
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-[var(--gold)]/90 text-primary border-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 shadow-md backdrop-blur-sm w-fit">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 fill-current" />
                Destacado
              </Badge>
            )}
            {lowStock && (
              <Badge className="bg-amber-500/90 text-white border-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 shadow-md backdrop-blur-sm w-fit">
                ¡Solo quedan {product.stock}!
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 shadow-md w-fit">
                Agotado
              </Badge>
            )}
          </div>

          {/* Quick view on hover */}
          {onViewDetails && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-background/90 backdrop-blur-sm text-foreground shadow-lg border-0 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium gap-1.5"
                onClick={(e) => { e.stopPropagation(); onViewDetails(product) }}
                aria-label={`Ver detalles de ${product.name}`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
            </div>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
          )}
        </div>
      </CardHeader>

      <CardContent className={`${isFeatured ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} space-y-1.5`}>
        <Badge
          variant="outline"
          className={`border-primary/20 text-muted-foreground font-normal ${isFeatured ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}
        >
          {product.category}
        </Badge>
        <h3 className={`font-semibold line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-200 ${isFeatured ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
          {product.name}
        </h3>
        {!isFeatured && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className={`pt-0 flex flex-col gap-2 ${isFeatured ? 'px-2.5 pb-2.5 sm:px-3 sm:pb-3' : 'px-3 pb-3 sm:px-4 sm:pb-4'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="min-w-0">
            {product.onSale && product.discountPrice != null ? (
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-red-500 line-through decoration-1 ${isFeatured ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                  ${product.price.toFixed(2)}
                </span>
                <span className={`font-bold text-green-600 ${isFeatured ? 'text-sm sm:text-base' : 'text-base sm:text-xl'}`}>
                  ${product.discountPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className={`font-bold text-foreground ${isFeatured ? 'text-sm sm:text-base' : 'text-base sm:text-xl'}`}>
                ${product.price.toFixed(2)}
              </span>
            )}
            {!isFeatured && (
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">USD</p>
            )}
          </div>

          {product.stock > 0 && !isFeatured && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center border border-border/60 rounded-full h-8">
                <button
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
                  onClick={(e) => { e.stopPropagation(); setQty(Math.max(0, qty - 1)) }}
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs font-medium tabular-nums">{qty + (justAdded ? 0 : 0)}</span>
                <button
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
                  onClick={(e) => { e.stopPropagation(); setQty(Math.min(product.stock, qty + 1)) }}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {product.stock > 0 && (
          <Button
            className={`w-full rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9 gap-1.5 ${
              justAdded
                ? 'bg-green-600 hover:bg-green-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {qty > 0 ? `Agregar (${qty})` : 'Agregar'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
