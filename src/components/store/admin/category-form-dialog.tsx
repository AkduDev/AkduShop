'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Category } from '@/types'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  formData: {
    name: string
    description: string
  }
  onChange: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  formData,
  onChange,
  onSubmit,
  onCancel
}: CategoryFormDialogProps) {
  const handleSubmit = () => {
    if (!formData.name) {
      alert('Por favor ingresa el nombre de la categoría')
      return
    }

    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Ej: Carteras de Cuero"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Descripción de la categoría..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {category ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
