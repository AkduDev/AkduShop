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
  stock: number
  featured: boolean
}

interface ProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    })
  }
  
  return (
    <Card className="group overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border-border/50 bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
          
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-[var(--gold)] text-primary hover:bg-[var(--gold)]/90 font-medium">
              Destacado
            </Badge>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-base px-4 py-1">Agotado</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <Badge variant="outline" className="mb-2 text-xs border-[var(--gold)]/30 text-muted-foreground">
          {product.category}
        </Badge>
        <h3 className="text-lg font-semibold line-clamp-1 text-foreground group-hover:text-[var(--gold)] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          <p className="text-xs text-muted-foreground">USD</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border/50 hover:border-[var(--gold)] hover:text-[var(--gold)]"
            onClick={() => onViewDetails?.(product)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
