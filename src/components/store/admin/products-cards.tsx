'use client'

import Image from 'next/image'
import { Pencil, Trash2, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/types'

interface ProductsCardsProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleFeatured: (product: Product) => void
}

export function ProductsCards({ products, onEdit, onDelete, onToggleFeatured }: ProductsCardsProps) {
  return (
    <div className="space-y-3 p-3 max-h-[600px] overflow-y-auto">
      {products.map((product) => (
        <Card key={product.id} className="border-border/50">
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => onToggleFeatured(product)}
                  >
                    {product.featured ? (
                      <Star className="h-4 w-4 text-[var(--gold)] fill-[var(--gold)]" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Badge variant="outline" className="border-[var(--gold)]/30 text-xs mb-2">
                  {product.category}
                </Badge>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    <Badge 
                      variant={product.stock > 0 ? 'default' : 'destructive'}
                      className={product.stock > 0 ? 'bg-green-600 text-xs' : 'text-xs'}
                    >
                      Stock: {product.stock}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-destructive hover:text-destructive"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
