'use client'

import Image from 'next/image'
import { Pencil, Trash2, Star, StarOff, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Product, PaginationData } from '@/types'

interface ProductsTableProps {
  products: Product[]
  pagination?: PaginationData
  onPageChange?: (page: number) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleFeatured: (product: Product) => void
}

export function ProductsTable({ products, pagination, onPageChange, onEdit, onDelete, onToggleFeatured }: ProductsTableProps) {
  return (
    <div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center hidden md:table-cell">Oferta</TableHead>
              <TableHead className="text-center hidden lg:table-cell">Destacado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm max-w-[150px] truncate">{product.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="border-primary/30 text-xs">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={product.stock > 0 ? 'default' : 'destructive'}
                    className={product.stock > 0 ? 'bg-green-600 dark:bg-green-700 text-xs' : 'text-xs'}
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {product.onSale ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <Badge className="bg-red-500/90 text-white text-[10px] px-1.5 py-0">
                        <Tag className="h-2.5 w-2.5 mr-0.5" />
                        Oferta
                      </Badge>
                      {product.discountPrice != null && (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">${product.discountPrice.toFixed(2)}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center hidden lg:table-cell">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 h-8 w-8"
                    onClick={() => onToggleFeatured(product)}
                  >
                    {product.featured ? (
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary h-8 w-8"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-border/30 px-1">
          <p className="text-xs text-muted-foreground">
            {pagination.total} productos · Página {pagination.page ?? 1} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange?.((pagination.page ?? 1) - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange?.((pagination.page ?? 1) + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
