'use client'

import Image from 'next/image'
import { Pencil, Trash2, Star, StarOff, Tag, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Product } from '@/types'

interface ProductsCardsProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleFeatured: (product: Product) => void
}

export function ProductsCards({ products, onEdit, onDelete, onToggleFeatured }: ProductsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 sm:p-3 max-h-[600px] overflow-y-auto">
      {products.map((product) => (
        <Card key={product.id} className="border-border/50 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 -mr-1"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onToggleFeatured(product)}>
                        {product.featured ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Quitar destacado
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2 text-[var(--gold)]" />
                            Destacar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge variant="outline" className="border-[var(--gold)]/30 text-[10px] sm:text-xs mb-1.5">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.onSale ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-red-500 line-through">${product.price.toFixed(2)}</span>
                      {product.discountPrice != null && (
                        <span className="text-sm font-bold text-green-600">${product.discountPrice.toFixed(2)}</span>
                      )}
                      <Badge className="bg-red-500/90 text-white text-[9px] px-1 py-0">
                        <Tag className="h-2 w-2 mr-0.5" />
                        Oferta
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                  )}
                  <Badge
                    variant={product.stock > 0 ? 'default' : 'destructive'}
                    className={`text-[10px] px-1.5 py-0 ${product.stock > 0 ? 'bg-green-600' : ''}`}
                  >
                    Stock: {product.stock}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
