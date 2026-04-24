'use client'

import Image from 'next/image'
import { ShoppingCart, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'

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

interface ProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
  variant?: 'default' | 'featured'
}

export function ProductCard({ product, onViewDetails, variant = 'default' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const isFeatured = variant === 'featured'
   
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    })
  }
   
  return (
    <Card className="group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-border/50 bg-card">
      <CardHeader className="p-0 relative">
        <div className={`relative overflow-hidden bg-gradient-to-br from-muted to-muted/50 ${isFeatured ? 'aspect-[4/5]' : 'aspect-square'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Enhanced overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {product.featured && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-[var(--gold)] to-[var(--gold)]/90 text-primary hover:from-[var(--gold)]/90 hover:to-[var(--gold)] font-medium text-[10px] sm:text-xs shadow-lg backdrop-blur-sm px-2 py-0.5">
              <span className="flex items-center gap-1">
                ⭐ Destacado
              </span>
            </Badge>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-xs sm:text-base px-3 py-1 sm:px-4 sm:py-1">Agotado</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={isFeatured ? 'p-2 sm:p-3' : 'p-1 sm:p-2'}>
        <Badge variant="outline" className={`mb-1 border-[var(--gold)]/30 text-muted-foreground ${isFeatured ? 'text-[9px] sm:text-xs' : 'text-[10px] sm:text-xs'}`}>
          {product.category}
        </Badge>
        <h3 className={`font-semibold line-clamp-1 text-foreground group-hover:text-[var(--gold)] transition-colors ${isFeatured ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'}`}>
          {product.name}
        </h3>
        {!isFeatured && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className={`pt-0 flex items-center justify-between gap-1.5 ${isFeatured ? 'p-2' : 'p-1 sm:p-2'}`}>
        <div className="flex-1 min-w-0">
          <span className={`font-bold text-foreground ${isFeatured ? 'text-sm sm:text-lg' : 'text-lg sm:text-2xl'}`}>
            ${product.price.toFixed(2)}
          </span>
          {!isFeatured && (
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">USD</p>
          )}
        </div>
        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full border-border/50 hover:border-[var(--gold)] hover:text-[var(--gold)] ${isFeatured ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-7 w-7 sm:h-9 sm:w-9'}`}
            onClick={() => onViewDetails?.(product)}
          >
            <Eye className={isFeatured ? 'h-2.5 w-2.5 sm:h-3 sm:w-3' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'} />
          </Button>
          <Button
            size="icon"
            className={`rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold)]/90 hover:from-[var(--gold)]/90 hover:to-[var(--gold)] text-primary shadow-md hover:shadow-lg transition-all ${isFeatured ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-7 w-7 sm:h-9 sm:w-9'}`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className={isFeatured ? 'h-2.5 w-2.5 sm:h-3 sm:w-3' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
