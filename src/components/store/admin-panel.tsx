'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  Plus, Pencil, Trash2, X, Save, Package, Star, StarOff, Upload, ImageIcon, 
  FolderPlus, Folder, TrendingUp, DollarSign, AlertTriangle, ShoppingCart,
  BarChart3, Users, ChevronRight, LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalStock: number
  lowStockProducts: number
  featuredProducts: number
  inventoryValue: number
}

interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  _count?: { products: number }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  categoryId: string
  stock: number
  featured: boolean
}

interface AdminPanelProps {
  onProductChange: () => void
}

export function AdminPanel({ onProductChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
    inventoryValue: 0
  })
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    stock: '',
    featured: false
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  })

  const calculateStats = (productsList: Product[], categoriesList: Category[]) => {
    const totalStock = productsList.reduce((sum, p) => sum + p.stock, 0)
    const lowStockProducts = productsList.filter(p => p.stock < 5).length
    const featuredProducts = productsList.filter(p => p.featured).length
    const inventoryValue = productsList.reduce((sum, p) => sum + (p.price * p.stock), 0)
    
    setStats({
      totalProducts: productsList.length,
      totalCategories: categoriesList.length,
      totalStock,
      lowStockProducts,
      featuredProducts,
      inventoryValue
    })
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products || data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()])
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
      calculateStats(products, categories)
    }
  }, [products, categories])
  
  // === PRODUCTS ===
  const handleOpenNewProduct = () => {
    setEditProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: categories[0]?.id || '',
      stock: '',
      featured: false
    })
    setImagePreview('')
    setIsProductDialogOpen(true)
  }
  
  const handleOpenEditProduct = (product: Product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      featured: product.featured
    })
    setImagePreview(product.imageUrl)
    setIsProductDialogOpen(true)
  }
  
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
      
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Error al subir la imagen')
      }
      
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url
      
      setImagePreview(imageUrl)
      setFormData(prev => ({ ...prev, imageUrl }))
      setIsUploading(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen. Inténtalo de nuevo.')
      setIsUploading(false)
    }
  }
  
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.imageUrl) {
      alert('Por favor añade una imagen al producto')
      return
    }
    
    if (!formData.categoryId) {
      alert('Por favor selecciona una categoría')
      return
    }
    
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
    const method = editProduct ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsProductDialogOpen(false)
        await fetchProducts()
        await fetchCategories()
        onProductChange()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }
  
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        await fetchProducts()
        await fetchCategories()
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
      await fetchProducts()
      await fetchCategories()
      onProductChange()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }
  
  // === CATEGORIES ===
  const handleOpenNewCategory = () => {
    setEditCategory(null)
    setCategoryForm({
      name: '',
      description: ''
    })
    setIsCategoryDialogOpen(true)
  }
  
  const handleOpenEditCategory = (category: Category) => {
    setEditCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    })
    setIsCategoryDialogOpen(true)
  }
  
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      alert('El nombre de la categoría es requerido')
      return
    }
    
    const url = editCategory ? `/api/categories/${editCategory.id}` : '/api/categories'
    const method = editCategory ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })
      
      if (res.ok) {
        setIsCategoryDialogOpen(false)
        await fetchCategories()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }
  
  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category?._count?.products && category._count.products > 0) {
      alert(`No se puede eliminar. Esta categoría tiene ${category._count.products} productos.`)
      return
    }
    
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        await fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestiona tu tienda de carteras</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Productos</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Stock Total</p>
                <p className="text-2xl font-bold">{stats.totalStock}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Stock Bajo</p>
                <p className={`text-2xl font-bold ${stats.lowStockProducts > 0 ? 'text-red-500' : ''}`}>
                  {stats.lowStockProducts}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Destacados</p>
                <p className="text-2xl font-bold">{stats.featuredProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valor Inventario</p>
                <p className="text-lg font-bold">${stats.inventoryValue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[var(--gold)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-lg border-border/50 bg-muted/20 h-12">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Categorías
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="m-0">
          <Card className="border-border/50 mt-4">
            <CardHeader>
              <CardTitle>Bienvenido al Panel de Administración</CardTitle>
              <CardDescription>
                Desde aquí puedes gestionar todos los aspectos de tu tienda de carteras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[var(--gold)]" />
                    Gestión de Productos
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Crear, editar y eliminar productos</li>
                    <li>• Marcar productos como destacados</li>
                    <li>• Control de stock</li>
                    <li>• Subir imágenes de productos</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Folder className="h-4 w-4 text-[var(--gold)]" />
                    Gestión de Categorías
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Crear y editar categorías</li>
                    <li>• Organizar productos por categorías</li>
                    <li>• Ver cantidad de productos por categoría</li>
                  </ul>
                </div>
              </div>
              {stats.lowStockProducts > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    Alerta de Stock Bajo
                  </h4>
                  <p className="text-sm">
                    Tienes {stats.lowStockProducts} producto{stats.lowStockProducts > 1 ? 's' : ''} con stock menor a 5 unidades.
                    Ve a la pestaña de Productos para revisar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          
        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="m-0">
          <Card className="border-border/50 mt-4">
            <div className="p-3 sm:p-4 border-b border-border/50 flex justify-end">
              <Button 
                onClick={handleOpenNewProduct}
                className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary text-sm sm:text-base"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Producto</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
            
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
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
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
                                  onClick={() => handleDeleteProduct(product.id)}
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
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-3 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <Card key={product.id} className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => toggleFeatured(product)}
                              >
                                {product.featured ? (
                                  <Star className="h-4 w-4 text-[var(--gold)] fill-[var(--gold)]" />
                                ) : (
                                  <StarOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                            <Badge variant="outline" className="border-[var(--gold)]/30 text-xs mb-2">
                              {product.category}
                            </Badge>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                                <Badge 
                                  variant={product.stock > 0 ? 'default' : 'destructive'}
                                  className={product.stock > 0 ? 'bg-green-600 text-xs' : 'text-xs'}
                                >
                                  Stock: {product.stock}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-10"
                            onClick={() => handleOpenEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
          
        {/* CATEGORIES TAB */}
        <TabsContent value="categories" className="m-0">
          <Card className="border-border/50 mt-4">
            <div className="p-3 sm:p-4 border-b border-border/50 flex justify-end">
              <Button 
                onClick={handleOpenNewCategory}
                className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary text-sm sm:text-base"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nueva Categoría</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Folder className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No hay categorías. ¡Crea la primera!</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
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
                                  onClick={() => handleOpenEditCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteCategory(category.id)}
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
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-3 max-h-[600px] overflow-y-auto">
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
                            onClick={() => handleOpenEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={(category._count?.products || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* PRODUCT DIALOG */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4 sm:space-y-5 mt-4">
            <div className="space-y-3">
              <Label>Imagen del Producto</Label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {isUploading ? 'Procesando...' : 'Subir Imagen'}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  <div className="text-center text-xs text-muted-foreground">
                    <p>O pega una URL:</p>
                  </div>
                  
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                      setImagePreview(e.target.value)
                    }}
                    className="h-12"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP. Máx 5MB
                  </p>
                </div>
              </div>
            </div>
            
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
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="h-12">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                disabled={isUploading}
              >
                <Save className="mr-2 h-4 w-4" />
                {editProduct ? 'Actualizar Producto' : 'Guardar Producto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-8"
                onClick={() => setIsProductDialogOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* CATEGORY DIALOG */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {editCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nombre de la Categoría</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="h-12"
                placeholder="Ej: Bolso de Mano"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Descripción (opcional)</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows={3}
                className="resize-none"
                placeholder="Descripción breve de la categoría"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                {editCategory ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-8"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
