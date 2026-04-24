import { useCallback } from 'react'
import { Category, CategoryFormData } from '@/types'
import { useCrud } from './use-crud'

export function useCategories() {
  const {
    items: categories,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setItems
  } = useCrud<Category, CategoryFormData, CategoryFormData>({ endpoint: '/api/categories' })

  const fetchCategories = useCallback(async () => {
    return await fetchItems()
  }, [fetchItems])

  const createCategory = useCallback(async (categoryData: CategoryFormData): Promise<boolean> => {
    const success = await createItem(categoryData)
    if (success) {
      await fetchCategories()
    }
    return success
  }, [createItem, fetchCategories])

  const updateCategory = useCallback(async (id: string, categoryData: CategoryFormData): Promise<boolean> => {
    const success = await updateItem(id, categoryData)
    if (success) {
      await fetchCategories()
    }
    return success
  }, [fetchCategories, updateItem])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteItem(id)
    if (success) {
      await fetchCategories()
    }
    return success
  }, [deleteItem, fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setItems
  }
}
