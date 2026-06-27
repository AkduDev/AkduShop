'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Tag, Upload, ImageIcon, Loader2 } from 'lucide-react'
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImagePreview(formData.imageUrl || null)
  }, [formData.imageUrl, open])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    try {
      if (!file.type.startsWith('image/')) {
        setUploadError('Por favor selecciona un archivo de imagen válido')
        setIsUploading(false)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('La imagen debe ser menor a 5MB')
        setIsUploading(false)
        return
      }

      const localPreview = URL.createObjectURL(file)
      setImagePreview(localPreview)

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

      URL.revokeObjectURL(localPreview)
      setImagePreview(imageUrl)
      onChange({ ...formData, imageUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.')
      setImagePreview(formData.imageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    onChange({ ...formData, imageUrl: '' })
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.categoryId || !formData.stock) {
      return
    }

    onSubmit()
  }

  const discountPercent = formData.discountPrice && formData.price
    ? Math.round((1 - parseFloat(formData.discountPrice) / parseFloat(formData.price)) * 100)
    : 0

  const isEditing = !!product

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Image Section */}
          <div className="space-y-2">
            <Label>Imagen del producto</Label>

            {imagePreview ? (
              <div className="relative group">
                <div className="relative w-full aspect-video sm:aspect-[16/10] rounded-lg overflow-hidden bg-muted border border-border/50">
                  <Image
                    src={imagePreview}
                    alt="Preview del producto"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo imagen...
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTriggerFileInput}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Reemplazar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleTriggerFileInput}
                className="flex flex-col items-center justify-center w-full aspect-video sm:aspect-[16/10] rounded-lg border-2 border-dashed border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <p className="text-sm font-medium">Haz clic para subir una imagen</p>
                    <p className="text-xs">JPG, PNG, GIF, WEBP (máx. 5MB)</p>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
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
          <Button onClick={handleSubmit} className="flex-1" disabled={isUploading}>
            {isEditing ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
