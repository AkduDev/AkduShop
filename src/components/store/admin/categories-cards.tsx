'use client'

import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Category } from '@/types'

interface CategoriesCardsProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoriesCards({ categories, onEdit, onDelete }: CategoriesCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 sm:p-3 max-h-[600px] overflow-y-auto">
      {categories.map((category) => (
        <Card key={category.id} className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base truncate">{category.name}</h4>
                {category.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 -mr-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(category.id)}
                    className="text-destructive"
                    disabled={(category._count?.products || 0) > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {category._count?.products || 0} producto{category._count?.products !== 1 ? 's' : ''}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
