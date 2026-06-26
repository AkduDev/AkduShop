'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CategoryFormData, PaginationData } from '@/types'

export function useCategories() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const queryKey = useMemo(() => ['categories', page], [page])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/categories?page=${page}&limit=50`)
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const json = await res.json()
      // Support both paginated { categories: [] } and flat array [] formats
      const items = json.categories ?? json.items ?? (Array.isArray(json) ? json : [])
      const pagination = json.pagination ?? { total: items.length, totalPages: 1, hasNextPage: false, hasPrevPage: false }
      return { categories: items, pagination }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000, // Categories rarely change, cache 60s
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
    categories: data?.categories ?? [],
    pagination: data?.pagination as PaginationData,
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    page,
    setPage,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setItems: () => {},
  }
}
