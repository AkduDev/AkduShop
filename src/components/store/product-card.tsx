'use client'

import { memo, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Star, Check, Tag, Heart } from 'lucide-react'
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
  const toggleItem = useWishlistStore((state) => state.toggleItem)
  const isWishlisted = useWishlistStore((state) => state.items.some((i) => i.id === product.id))
  const { toast } = useToast()
  const isFeatured = variant === 'featured'
  const [justAdded, setJustAdded] = useState(false)
  const addedTimerRef = useRef<NodeJS.Timeout | null>(null)

  const lowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock <= 0

  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }
  }, [])

  const handleAddToCart = () => {
    const priceToAdd = product.onSale && product.discountPrice != null ? product.discountPrice : product.price
    addItem({
      id: product.id,
      name: product.name,
      price: priceToAdd,
      imageUrl: product.imageUrl
    })
    setJustAdded(true)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 1500)
    toast({ title: 'Agregado al carrito', description: product.name })
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
    <Card className="group relative overflow-hidden rounded-2xl border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 motion-safe:hover:-translate-y-1 flex flex-col h-full">
      {/* === IMAGE SECTION === */}
      <CardHeader className="p-0 relative">
        <div className={`relative overflow-hidden bg-muted ${isFeatured ? 'aspect-[3/4]' : 'aspect-square'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges - top left */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
            {product.onSale && (
              <Badge className="bg-red-500 dark:bg-warm-accent text-white dark:text-warm-accent-foreground border-0 text-[10px] sm:text-xs font-bold px-2 py-0.5 shadow-lg w-fit">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 fill-current" />
                Oferta
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-[var(--gold)] text-primary border-0 text-[10px] sm:text-xs font-bold px-2 py-0.5 shadow-lg w-fit">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 fill-current" />
                Destacado
              </Badge>
            )}
            {lowStock && (
              <Badge className="bg-amber-500 dark:bg-amber-600 text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-0.5 shadow-lg w-fit animate-pulse">
                ¡Solo quedan {product.stock}!
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs font-bold px-2 py-0.5 shadow-lg w-fit">
                Agotado
              </Badge>
            )}
          </div>

          {/* Wishlist button - top right corner */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 rounded-full p-2 backdrop-blur-md transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 dark:bg-black/60 dark:text-gray-300 dark:hover:bg-red-950 dark:hover:text-red-400'
            }`}
            aria-label={isWishlisted ? `Eliminar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
            aria-pressed={isWishlisted}
          >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
          </button>

          {/* Sold out overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
          )}
        </div>
      </CardHeader>

      {/* === CONTENT SECTION === */}
      <CardContent className={`${isFeatured ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} space-y-1.5 flex-1`}>
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

        {/* Description - visible on sm+ */}
        {!isFeatured && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block min-h-[2rem]">
            {product.description || 'Sin descripción'}
          </p>
        )}

        {/* Price */}
        <div className="pt-1">
          {product.onSale && product.discountPrice != null ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-muted-foreground line-through decoration-1 text-xs sm:text-sm">
                ${product.price.toFixed(2)}
              </span>
              <span className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">
                ${product.discountPrice.toFixed(2)}
              </span>
              <Badge className="bg-red-500/10 text-red-600 dark:text-warm-accent border-0 text-[10px] font-bold px-1.5 py-0">
                -{Math.round((1 - product.discountPrice / product.price) * 100)}%
              </Badge>
            </div>
          ) : (
            <span className="font-bold text-foreground text-base sm:text-lg">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      {/* === ACTIONS SECTION === */}
      <CardFooter className={`pt-0 ${isFeatured ? 'px-2.5 pb-2.5 sm:px-3 sm:pb-3' : 'px-3 pb-3 sm:px-4 sm:pb-4'} flex flex-col gap-2.5`}>
        {product.stock > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              className={`w-full rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm h-9 sm:h-10 gap-1.5 active:scale-[0.97] font-semibold ${
                justAdded
                  ? 'bg-green-600 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-700 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              onClick={handleAddToCart}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al Carrito
                </>
              )}
            </Button>

            {onViewDetails && (
              <Button
                variant="outline"
                className="w-full rounded-full border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9 gap-1.5 active:scale-[0.97]"
                onClick={(e) => { e.stopPropagation(); onViewDetails(product) }}
                aria-label={`Ver detalles de ${product.name}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Ver Detalles
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            disabled
            className="w-full rounded-full border-border/40 text-muted-foreground h-10 sm:h-11 cursor-not-allowed"
          >
            Agotado
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
