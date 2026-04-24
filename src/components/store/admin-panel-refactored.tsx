'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Package, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatsCards } from './admin/stats-cards'
import { DashboardWelcome } from './admin/dashboard-welcome'
import { ProductsTable } from './admin/products-table'
import { ProductsCards } from './admin/products-cards'
import { CategoriesTable } from './admin/categories-table'
import { CategoriesCards } from './admin/categories-cards'
import { ProductFormDialog } from './admin/product-form-dialog'
import { CategoryFormDialog } from './admin/category-form-dialog'
import { AdminSection } from './admin/admin-section'
import { StatsCardsSkeleton } from '@/components/ui/skeletons/stats-cards-skeleton'
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { Product, Category, ProductFormData, CategoryFormData, DashboardStats } from '@/types'

interface AdminPanelProps {
  onProductChange: () => void
}

export function AdminPanel({ onProductChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
    inventoryValue: 0
  })

  // Hooks personalizados
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct, toggleFeatured } = useProducts()
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories()

  // Estados para diálogos
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    stock: '',
    featured: false
  })
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ])
    }
    fetchData()
  }, [fetchProducts, fetchCategories])

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

  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
      calculateStats(products, categories)
    }
  }, [products, categories])

  // CRUD Productos
  const handleCreateProduct = async () => {
    const success = await createProduct({
      ...productFormData,
      price: parseFloat(productFormData.price),
      stock: parseInt(productFormData.stock)
    })
    
    if (success) {
      resetProductForm()
      onProductChange()
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    const success = await updateProduct(editingProduct.id, {
      ...productFormData,
      price: parseFloat(productFormData.price),
      stock: parseInt(productFormData.stock)
    })
    
    if (success) {
      resetProductForm()
      onProductChange()
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const success = await deleteProduct(id)
      if (success) onProductChange()
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    await toggleFeatured(product)
    onProductChange()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      featured: product.featured
    })
    setImagePreview(product.imageUrl)
    setShowProductForm(true)
  }

  // CRUD Categorías
  const handleCreateCategory = async () => {
    const success = await createCategory(categoryFormData)
    if (success) {
      setCategoryFormData({ name: '', description: '' })
      setShowCategoryForm(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    
    const success = await updateCategory(editingCategory.id, categoryFormData)
    if (success) {
      setCategoryFormData({ name: '', description: '' })
      setEditingCategory(null)
      setShowCategoryForm(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      const success = await deleteCategory(id)
      if (success) onProductChange()
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowCategoryForm(true)
  }

  // Form helpers
  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: '',
      stock: '',
      featured: false
    })
    setImagePreview(null)
    setEditingProduct(null)
    setShowProductForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Gestiona tu tienda de carteras
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">Productos</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categorías</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="m-0 space-y-4 sm:space-y-6">
            {loading ? (
              <StatsCardsSkeleton />
            ) : (
              <>
                <StatsCards stats={stats} />
                <DashboardWelcome stats={stats} />
              </>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="m-0">
            <AdminSection
              title="Gestión de Productos"
              description={`${products.length} productos en total`}
              icon={<Package className="h-5 w-5 text-[var(--gold)]" />}
              action={
                <Button
                  onClick={() => {
                    resetProductForm()
                    setShowProductForm(true)
                  }}
                  className="w-full sm:w-auto h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              }
              loading={loading}
              desktopView={
                <ProductsTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleFeatured={handleToggleFeatured}
                />
              }
              mobileView={
                <ProductsCards
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleFeatured={handleToggleFeatured}
                />
              }
              desktopSkeleton={<TableSkeleton rows={5} columns={7} />}
              mobileSkeleton={
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="w-20 h-20 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }
            />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="m-0">
            <AdminSection
              title="Gestión de Categorías"
              description={`${categories.length} categorías en total`}
              icon={<Folder className="h-5 w-5 text-[var(--gold)]" />}
              action={
                <Button
                  onClick={() => {
                    setEditingCategory(null)
                    setCategoryFormData({ name: '', description: '' })
                    setShowCategoryForm(true)
                  }}
                  className="w-full sm:w-auto h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              }
              loading={loading}
              desktopView={
                <CategoriesTable
                  categories={categories}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              }
              mobileView={
                <CategoriesCards
                  categories={categories}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              }
              desktopSkeleton={<TableSkeleton rows={5} columns={4} />}
              mobileSkeleton={
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={editingProduct}
        categories={categories}
        formData={productFormData}
        onChange={setProductFormData}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        onCancel={resetProductForm}
      />

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        category={editingCategory}
        formData={categoryFormData}
        onChange={setCategoryFormData}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        onCancel={() => {
          setCategoryFormData({ name: '', description: '' })
          setEditingCategory(null)
          setShowCategoryForm(false)
        }}
      />
    </div>
  )
}
