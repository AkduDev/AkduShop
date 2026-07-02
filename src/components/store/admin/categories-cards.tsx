'use client'

import { Pencil, Trash2, MoreVertical, Folder, Box } from 'lucide-react'
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
import { Category } from '@/types'

const categoryColors: Record<string, { bg: string; icon: string; border: string }> = {
  'Electrónicos': { bg: 'from-blue-500/10 to-blue-600/5', icon: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20 dark:border-blue-500/30' },
  'Ropa y Accesorios': { bg: 'from-purple-500/10 to-purple-600/5', icon: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20 dark:border-purple-500/30' },
  'Hogar y Decoración': { bg: 'from-amber-500/10 to-amber-600/5', icon: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20 dark:border-amber-500/30' },
  'Deportes y Aire Libre': { bg: 'from-green-500/10 to-green-600/5', icon: 'text-green-500 dark:text-green-400', border: 'border-green-500/20 dark:border-green-500/30' },
  'Salud y Belleza': { bg: 'from-pink-500/10 to-pink-600/5', icon: 'text-pink-500 dark:text-pink-400', border: 'border-pink-500/20 dark:border-pink-500/30' },
  'Juguetes y Entretenimiento': { bg: 'from-orange-500/10 to-orange-600/5', icon: 'text-orange-500 dark:text-orange-400', border: 'border-orange-500/20 dark:border-orange-500/30' },
}

const defaultColor = { bg: 'from-primary/10 to-primary/5', icon: 'text-primary', border: 'border-primary/20' }

interface CategoriesCardsProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoriesCards({ categories, onEdit, onDelete }: CategoriesCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 sm:p-3 max-h-[600px] overflow-y-auto">
      {categories.map((category) => {
        const colors = categoryColors[category.name] || defaultColor
        const productCount = category._count?.products || 0

        return (
          <Card
            key={category.id}
            className={`group border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300`}
          >
            <CardContent className="p-0">
              {/* Colored Header */}
              <div className={`relative bg-gradient-to-br ${colors.bg} px-4 py-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white/80 dark:bg-card/80 shadow-sm ${colors.icon}`}>
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base text-foreground">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 max-w-[200px]">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Pencil className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(category.id)}
                        className="text-destructive focus:text-destructive"
                        disabled={productCount > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-border/30">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Box className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    {productCount} producto{productCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-medium text-primary hover:text-primary"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
