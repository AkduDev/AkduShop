import { useCallback } from 'react'
import { Product, ProductFormData, PaginationData } from '@/types'
import { useCrud } from './use-crud'

export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>

export function useProducts(selectedCategory: string = 'all') {
  const {
    items: products,
    loading,
    error,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setItems
  } = useCrud<Product, ProductPayload, ProductPayload>({ endpoint: '/api/products' })

  const fetchProducts = useCallback(async (page: number = 1) => {
    const query = `page=${page}&limit=12&categoryId=${selectedCategory}`
    return await fetchItems(query)
  }, [fetchItems, selectedCategory])

  const createProduct = useCallback(async (productData: ProductPayload): Promise<boolean> => {
    const success = await createItem(productData)
    if (success) {
      await fetchProducts()
    }
    return success
  }, [createItem, fetchProducts])

  const updateProduct = useCallback(async (id: string, productData: ProductPayload): Promise<boolean> => {
    const success = await updateItem(id, productData)
    if (success) {
      await fetchProducts()
    }
    return success
  }, [fetchProducts, updateItem])

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteItem(id)
    if (success) {
      await fetchProducts()
    }
    return success
  }, [deleteItem, fetchProducts])

  const toggleFeatured = useCallback(async (product: Product): Promise<boolean> => {
    const { category, ...payload } = product
    const success = await updateItem(product.id, {
      ...payload,
      featured: !product.featured
    })
    if (success) {
      await fetchProducts()
    }
    return success
  }, [fetchProducts, updateItem])

  return {
    products,
    loading,
    error,
    pagination: pagination as PaginationData,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
    setItems
  }
}
