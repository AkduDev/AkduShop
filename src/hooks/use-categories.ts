import { useState, useCallback } from 'react'
import { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      
      if (res.ok) {
        await fetchCategories()
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating category:', error)
      return false
    }
  }, [fetchCategories])

  const updateCategory = useCallback(async (id: string, categoryData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      
      if (res.ok) {
        await fetchCategories()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating category:', error)
      return false
    }
  }, [fetchCategories])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        await fetchCategories()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    }
  }, [fetchCategories])

  return {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setCategories
  }
}
