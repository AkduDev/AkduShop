'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Star, Plus, Minus, Check, Tag, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { useToast } from '@/hooks/use-toast'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
  variant?: 'default' | 'featured'
}

export const ProductCard = memo(function ProductCard({ product, onViewDetails, variant = 'default' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { toggleItem, items: wishlistItems } = useWishlistStore()
  const { toast } = useToast()
  const isFeatured = variant === 'featured'
  const [qty, setQty] = useState(0)
  const [justAdded, setJustAdded] = useState(false)
  const isWishlisted = wishlistItems.some((i) => i.id === product.id)

  const lowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = () => {
    const addQty = qty > 0 ? qty : 1
    const priceToAdd = product.onSale && product.discountPrice != null ? product.discountPrice : product.price
    addItem({
      id: product.id,
      name: product.name,
      price: priceToAdd,
      imageUrl: product.imageUrl
    }, addQty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
    setQty(0)
    toast({ title: 'Agregado al carrito', description: `${product.name} × ${addQty}` })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.imageUrl,
      category: product.category,
    })
    toast({
      title: isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      description: product.name,
    })
  }

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className={`relative overflow-hidden bg-muted ${isFeatured ? 'aspect-[3/4]' : 'aspect-square'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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

          {/* Wishlist button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 rounded-full p-1.5 backdrop-blur-sm transition-all duration-200 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-background/80 text-muted-foreground hover:text-red-500 hover:bg-background/90'
            }`}
            aria-label={isWishlisted ? `Eliminar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

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
          <Link href={`/products/${product.id}`} className="hover:underline" prefetch={false}>
            {product.name}
          </Link>
        </h3>
        {!isFeatured && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className={`pt-0 ${isFeatured ? 'px-2.5 pb-2.5 sm:px-3 sm:pb-3' : 'px-3 pb-3 sm:px-4 sm:pb-4'}`}>
        <div className="flex items-center justify-between w-full mb-2">
          <div className="min-w-0">
            {product.onSale && product.discountPrice != null ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-bold text-muted-foreground line-through decoration-1 text-xs sm:text-sm`}>
                  ${product.price.toFixed(2)}
                </span>
                <span className={`font-bold text-green-600 text-sm sm:text-base`}>
                  ${product.discountPrice.toFixed(2)}
                </span>
                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-[10px] font-semibold px-1.5 py-0">
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                </Badge>
              </div>
            ) : (
              <span className={`font-bold text-foreground text-base sm:text-lg`}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {product.stock > 0 && !isFeatured && (
            <div className="flex items-center">
              <div className="flex items-center border border-border/60 rounded-full h-9">
                <button
                  className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full active:scale-90"
                  onClick={(e) => { e.stopPropagation(); setQty(Math.max(0, qty - 1)) }}
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                <button
                  className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full active:scale-90"
                  onClick={(e) => { e.stopPropagation(); setQty(Math.min(product.stock, qty + 1)) }}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {product.stock > 0 && (
          <div className="flex gap-2 w-full">
            <Button
              className={`flex-1 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm h-10 sm:h-9 gap-1.5 active:scale-95 ${
                justAdded
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              onClick={handleAddToCart}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {qty > 0 ? `Agregar (${qty})` : 'Agregar'}
                </>
              )}
            </Button>
            {onViewDetails && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-9 sm:w-9 rounded-full border-border/60 shrink-0 active:scale-90"
                onClick={(e) => { e.stopPropagation(); onViewDetails(product) }}
                aria-label={`Ver detalles de ${product.name}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
})
