'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CategoryFormData } from '@/types'

export function useCategories() {
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const json = await res.json()
      return json.categories ?? json.items ?? json ?? []
    },
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: async (payload: CategoryFormData) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al crear categoría')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CategoryFormData }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al actualizar categoría')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar categoría')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const fetchCategories = useCallback(async () => {
    return true
  }, [])

  const createCategory = useCallback(async (payload: CategoryFormData): Promise<boolean> => {
    try { return await createMutation.mutateAsync(payload) }
    catch { return false }
  }, [createMutation])

  const updateCategory = useCallback(async (id: string, payload: CategoryFormData): Promise<boolean> => {
    try { return await updateMutation.mutateAsync({ id, payload }) }
    catch { return false }
  }, [updateMutation])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try { return await deleteMutation.mutateAsync(id) }
    catch { return false }
  }, [deleteMutation])

  return {
    categories: Array.isArray(data) ? data : [],
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setItems: () => {},
  }
}
