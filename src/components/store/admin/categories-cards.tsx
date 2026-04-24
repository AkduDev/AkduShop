'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Category } from '@/types'

interface CategoriesCardsProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoriesCards({ categories, onEdit, onDelete }: CategoriesCardsProps) {
  return (
    <div className="space-y-3 p-3 max-h-[600px] overflow-y-auto">
      {categories.map((category) => (
        <Card key={category.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                )}
                <Badge variant="secondary" className="text-xs">
                  {category._count?.products || 0} producto{category._count?.products !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10"
                onClick={() => onEdit(category)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 text-destructive hover:text-destructive"
                onClick={() => onDelete(category.id)}
                disabled={(category._count?.products || 0) > 0}
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
