import { useState, useCallback } from 'react'
import { Product, ProductsResponse, PaginationData } from '@/types'

export function useProducts(selectedCategory: string = 'all') {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0
  })

  const fetchProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `/api/products?page=${page}&limit=12&categoryId=${selectedCategory}`
      )
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      
      const data: ProductsResponse = await res.json()
      
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error fetching products:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  const createProduct = useCallback(async (productData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (res.ok) {
        await fetchProducts()
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating product:', error)
      return false
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: string, productData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (res.ok) {
        await fetchProducts()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        await fetchProducts()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }, [fetchProducts])

  const toggleFeatured = useCallback(async (product: Product): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          featured: !product.featured
        })
      })
      
      if (res.ok) {
        await fetchProducts()
        return true
      }
      return false
    } catch (error) {
      console.error('Error toggling featured:', error)
      return false
    }
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
    setProducts
  }
}
