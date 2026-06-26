'use client'

import { Pencil, Trash2 } from 'lucide-react'
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
import { Category } from '@/types'

interface CategoriesTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="hover:bg-transparent">
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-center">Productos</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {category.description || '-'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {category._count?.products || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(category.id)}
                    disabled={(category._count?.products || 0) > 0}
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
