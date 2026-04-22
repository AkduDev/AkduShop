'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Save, Package, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
  featured: boolean
}

interface AdminPanelProps {
  onProductChange: () => void
}

export function AdminPanel({ onProductChange }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    stock: '',
    featured: false
  })
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleOpenNewProduct = () => {
    setEditProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: '',
      stock: '',
      featured: false
    })
    setIsDialogOpen(true)
  }
  
  const handleOpenEditProduct = (product: Product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock.toString(),
      featured: product.featured
    })
    setIsDialogOpen(true)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
    const method = editProduct ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsDialogOpen(false)
        fetchProducts()
        onProductChange()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        fetchProducts()
        onProductChange()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
  
  const toggleFeatured = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          featured: !product.featured
        })
      })
      fetchProducts()
      onProductChange()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }
  
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
            <Package className="h-5 w-5 text-[var(--gold)]" />
          </div>
          Panel de Administración
        </CardTitle>
        <Button 
          onClick={handleOpenNewProduct}
          className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
            <p className="mt-4">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>No hay productos. ¡Añade el primero!</p>
          </div>
        ) : (
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
                        onClick={() => toggleFeatured(product)}
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
                          onClick={() => handleOpenEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
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
        )}
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Ejecutivos, Carteras, Mochilas"
                  className="h-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-12"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <Label htmlFor="featured" className="font-medium">Producto Destacado</Label>
                <p className="text-sm text-muted-foreground">Se mostrará en la sección principal</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                {editProduct ? 'Actualizar Producto' : 'Guardar Producto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-8"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
