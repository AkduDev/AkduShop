'use client'

import Image from 'next/image'
import { ShoppingCart, X, Star, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  if (!product) return null
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    })
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-muted to-muted/50">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-[var(--gold)] text-primary font-medium">
                <Star className="w-3 h-3 mr-1 fill-primary" />
                Destacado
              </Badge>
            )}
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur hover:bg-background"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content Section */}
          <div className="p-8 flex flex-col">
            <Badge variant="outline" className="w-fit mb-3 border-[var(--gold)]/30">
              {product.category}
            </Badge>
            
            <h2 className="text-3xl font-bold mb-3">{product.name}</h2>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">USD</span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
              {product.description}
            </p>
            
            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    En Stock ({product.stock} disponibles)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-destructive font-medium">
                    Agotado
                  </span>
                </>
              )}
            </div>
            
            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[var(--gold)]" />
                <span>Envío a toda Cuba</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[var(--gold)]" />
                <span>Garantía de calidad</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[var(--gold)]" />
                <span>Pago contra entrega</span>
              </div>
            </div>
            
            <Button
              size="lg"
              className="w-full h-14 text-lg rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Añadir al Carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
