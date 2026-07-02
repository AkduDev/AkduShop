'use client'

import Image from 'next/image'
import { Pencil, Trash2, Star, StarOff, Tag, MoreVertical, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
        <Card
          key={product.id}
          className="group border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
        >
          <CardContent className="p-0">
            {/* Image */}
            <div className="relative h-36 sm:h-40 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Top badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <Badge className="bg-[var(--gold)] text-white text-[10px] px-1.5 py-0 w-fit shadow-md">
                    <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                    Destacado
                  </Badge>
                )}
                {product.onSale && (
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 w-fit shadow-md">
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    Oferta
                  </Badge>
                )}
              </div>

              {/* Menu */}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-sm shadow-md"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onToggleFeatured(product)}>
                      {product.featured ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2 text-muted-foreground" />
                          Quitar destacado
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2 text-[var(--gold)]" />
                          Destacar producto
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Price overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-end justify-between">
                  <div>
                    {product.onSale && product.discountPrice != null ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-white drop-shadow-lg">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-white/70 line-through drop-shadow">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-white drop-shadow-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 space-y-2.5">
              <div>
                <h4 className="font-semibold text-sm sm:text-base truncate text-foreground">
                  {product.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={product.stock > 0 ? 'default' : 'destructive'}
                  className={`text-[10px] px-2 py-0.5 ${
                    product.stock > 0
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                      : ''
                  }`}
                >
                  <Package className="h-2.5 w-2.5 mr-1" />
                  {product.stock} en stock
                </Badge>
                {product.onSale && product.discountPrice != null && (
                  <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] px-2 py-0.5">
                    -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs font-medium hover:bg-primary/5 hover:border-primary/20"
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
