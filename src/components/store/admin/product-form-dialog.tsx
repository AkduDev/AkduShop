'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product, Category } from '@/types'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: Category[]
  formData: {
    name: string
    description: string
    price: string
    discountPrice: string
    imageUrl: string
    categoryId: string
    stock: string
    featured: boolean
    onSale: boolean
  }
  onChange: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  formData,
  onChange,
  onSubmit,
  onCancel
}: ProductFormDialogProps) {
  const [imagePreview, setImagePreview] = useState(formData.imageUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        setIsUploading(false)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        setIsUploading(false)
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!uploadRes.ok) {
        throw new Error('Error al subir la imagen')
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url

      setImagePreview(imageUrl)
      onChange({ ...formData, imageUrl })
      setIsUploading(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen. Inténtalo de nuevo.')
      setIsUploading(false)
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.categoryId || !formData.stock) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    onSubmit()
  }

  const discountPercent = formData.discountPrice && formData.price
    ? Math.round((1 - parseFloat(formData.discountPrice) / parseFloat(formData.price)) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Imagen del producto</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Subiendo imagen...
                  </p>
                )}
              </div>
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted border border-border/50">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null)
                      onChange({ ...formData, imageUrl: '' })
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Ej: Cartera Elegance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Descripción del producto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => onChange({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => onChange({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => onChange({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Section */}
          <div className="p-4 rounded-lg border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="onSale">En rebaja</Label>
                  <p className="text-sm text-muted-foreground">
                    Marcar como oferta para la sección de rebajas
                  </p>
                </div>
              </div>
              <Switch
                id="onSale"
                checked={formData.onSale}
                onCheckedChange={(checked) => onChange({ ...formData, onSale: checked })}
              />
            </div>

            {formData.onSale && (
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Precio de oferta (USD)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => onChange({ ...formData, discountPrice: e.target.value })}
                    placeholder="0.00"
                    className="flex-1"
                  />
                  {discountPercent > 0 && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {formData.discountPrice && formData.price && parseFloat(formData.discountPrice) >= parseFloat(formData.price) && (
                  <p className="text-sm text-destructive">
                    El precio de oferta debe ser menor al precio original
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <Label htmlFor="featured">Producto destacado</Label>
              <p className="text-sm text-muted-foreground">
                Aparecerá en la sección de destacados
              </p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => onChange({ ...formData, featured: checked })}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {product ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
