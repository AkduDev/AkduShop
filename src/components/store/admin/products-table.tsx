'use client'

import Image from 'next/image'
import { Pencil, Trash2, Star, StarOff } from 'lucide-react'
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
import { Product } from '@/types'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleFeatured: (product: Product) => void
}

export function ProductsTable({ products, onEdit, onDelete, onToggleFeatured }: ProductsTableProps) {
  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Destacado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[var(--gold)]/30">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                ${product.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={product.stock > 0 ? 'default' : 'destructive'}
                  className={product.stock > 0 ? 'bg-green-600' : ''}
                >
                  {product.stock}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[var(--gold)]/10"
                  onClick={() => onToggleFeatured(product)}
                >
                  {product.featured ? (
                    <Star className="h-5 w-5 text-[var(--gold)] fill-[var(--gold)]" />
                  ) : (
                    <StarOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
