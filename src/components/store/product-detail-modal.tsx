'use client'

import Image from 'next/image'
import { ShoppingCart, X } from 'lucide-react'
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalles del producto</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600">
                Destacado
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-2">
              {product.category}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-3xl font-bold text-primary mb-4">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground mb-4 flex-1">
              {product.description}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              {product.stock > 0 ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  En Stock ({product.stock} disponibles)
                </Badge>
              ) : (
                <Badge variant="destructive">Agotado</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir al Carrito
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
