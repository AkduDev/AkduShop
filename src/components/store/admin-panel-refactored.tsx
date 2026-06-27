'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Package, Folder, Settings, LayoutDashboard, Box, Tag, ChevronLeft, ShoppingBag, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { SettingsPanel } from './admin/settings-panel'
import { OrdersTable } from './admin/orders-table'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { Product, Category, ProductFormData, CategoryFormData, DashboardStats } from '@/types'

interface AdminPanelProps {
  onProductChange: () => void
}

export function AdminPanel({ onProductChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
    onSaleProducts: 0,
    inventoryValue: 0
  })

  // Hooks personalizados — admin carga todos los items (límite alto)
  const { products, loading: productsLoading, pagination: productsPagination, page: productPage, setPage: setProductPage, fetchProducts, createProduct, updateProduct, deleteProduct, toggleFeatured } = useProducts({ limit: 100 })
  const { categories, loading: categoriesLoading, pagination: categoriesPagination, page: categoryPage, setPage: setCategoryPage, createCategory, updateCategory, deleteCategory } = useCategories()
  const loading = productsLoading || categoriesLoading

  // Estados para diálogos
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    imageUrl: '',
    categoryId: '',
    stock: '',
    featured: false,
    onSale: false
  })
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const calculateStats = (productsList: Product[], categoriesList: Category[]) => {
    const totalStock = productsList.reduce((sum, p) => sum + p.stock, 0)
    const lowStockProducts = productsList.filter(p => p.stock < 5).length
    const featuredProducts = productsList.filter(p => p.featured).length
    const onSaleProducts = productsList.filter(p => p.onSale).length
    const inventoryValue = productsList.reduce((sum, p) => sum + (p.price * p.stock), 0)

    setStats({
      totalProducts: productsList.length,
      totalCategories: categoriesList.length,
      totalStock,
      lowStockProducts,
      featuredProducts,
      onSaleProducts,
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
      discountPrice: productFormData.discountPrice ? parseFloat(productFormData.discountPrice) : null,
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
      discountPrice: productFormData.discountPrice ? parseFloat(productFormData.discountPrice) : null,
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
      discountPrice: product.discountPrice?.toString() || '',
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      featured: product.featured,
      onSale: product.onSale
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
      discountPrice: '',
      imageUrl: '',
      categoryId: '',
      stock: '',
      featured: false,
      onSale: false
    })
    setImagePreview(null)
    setEditingProduct(null)
    setShowProductForm(false)
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Productos', icon: Box },
    { key: 'categories', label: 'Categorías', icon: Tag },
    { key: 'orders', label: 'Órdenes', icon: ShoppingBag },
    { key: 'settings', label: 'Configuración', icon: Settings },
  ]

  const handleNavClick = (key: string) => {
    setActiveTab(key)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-primary/10 transition-colors"
                onClick={() => window.location.href = '/'}
                title="Volver al inicio"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </Button>
              <div className="hidden sm:block w-px h-6 bg-border/50" />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Gestiona tu tienda</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 inline-block mr-1.5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-lg hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/98 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1" aria-label="Navegación móvil">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <Separator className="border-border/30" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden" />

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
              description={`${productsPagination?.total ?? products.length} productos en total`}
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
                  pagination={productsPagination}
                  onPageChange={(p) => setProductPage(p)}
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
              description={`${categoriesPagination?.total ?? categories.length} categorías en total`}
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
                  pagination={categoriesPagination}
                  onPageChange={(p) => setCategoryPage(p)}
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="m-0">
            <SettingsPanel />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="m-0">
            <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/5">
                    <ShoppingBag className="h-5 w-5 text-[var(--gold)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Órdenes de Compra</h2>
                    <p className="text-sm text-muted-foreground">
                      Historial de pedidos de clientes
                    </p>
                  </div>
                </div>
              </div>
              <OrdersTable onStatusChange={async () => {}} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

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
