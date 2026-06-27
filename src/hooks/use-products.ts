'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, PaginationData } from '@/types'

export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>

interface UseProductsOptions {
  category?: string
  limit?: number
  featured?: boolean
  onSale?: boolean
  search?: string
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category: selectedCategory = 'all', limit = 12, featured, onSale, search } = options
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const queryKey = useMemo(
    () => ['products', selectedCategory, page, limit, featured, onSale, search],
    [selectedCategory, page, limit, featured, onSale, search]
  )

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        categoryId: selectedCategory,
      })
      if (featured) params.set('featured', 'true')
      if (onSale) params.set('onSale', 'true')
      if (search) params.set('search', search)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const json = await res.json()
      return {
        products: json.products ?? json.items ?? [],
        pagination: json.pagination ?? { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const fetchProducts = useCallback(async (newPage?: number) => {
    if (newPage) setPage(newPage)
    return true
  }, [])

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al crear producto')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProductPayload }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al actualizar producto')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar producto')
      return true
    },
    onSuccess: () => invalidate(),
  })

  const createProduct = useCallback(async (payload: ProductPayload): Promise<boolean> => {
    try { return await createMutation.mutateAsync(payload) }
    catch { return false }
  }, [createMutation])

  const updateProduct = useCallback(async (id: string, payload: ProductPayload): Promise<boolean> => {
    try { return await updateMutation.mutateAsync({ id, payload }) }
    catch { return false }
  }, [updateMutation])

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try { return await deleteMutation.mutateAsync(id) }
    catch { return false }
  }, [deleteMutation])

  const toggleFeatured = useCallback(async (product: Product): Promise<boolean> => {
    const { category, ...payload } = product
    try {
      return await updateMutation.mutateAsync({
        id: product.id,
        payload: { ...payload, featured: !product.featured },
      })
    } catch { return false }
  }, [updateMutation])

  return {
    products: data?.products ?? [],
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    pagination: data?.pagination as PaginationData,
    page,
    setPage,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
  }
}
