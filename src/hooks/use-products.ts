'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, PaginationData } from '@/types'

export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>

interface UseProductsOptions {
  category?: string
  limit?: number
  featured?: boolean
  onSale?: boolean
  search?: string
  sortBy?: string
  priceRange?: string
  infinite?: boolean
}

async function fetchProductsPage(params: {
  page: number
  limit: number
  categoryId: string
  featured?: boolean
  onSale?: boolean
  search?: string
  sortBy?: string
  priceRange?: string
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    categoryId: params.categoryId,
  })
  if (params.featured) searchParams.set('featured', 'true')
  if (params.onSale) searchParams.set('onSale', 'true')
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy && params.sortBy !== 'default') searchParams.set('sortBy', params.sortBy)
  if (params.priceRange && params.priceRange !== 'all') searchParams.set('priceRange', params.priceRange)

  const res = await fetch(`/api/products?${searchParams.toString()}`)
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
  const json = await res.json()
  return {
    products: (json.products ?? json.items ?? []) as Product[],
    pagination: (json.pagination ?? { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }) as PaginationData,
  }
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category: selectedCategory = 'all', limit = 12, featured, onSale, search, sortBy = 'default', priceRange = 'all', infinite = false } = options
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const baseFilters = useMemo(
    () => ({ categoryId: selectedCategory, featured, onSale, search, sortBy, priceRange }),
    [selectedCategory, featured, onSale, search, sortBy, priceRange]
  )

  // Infinite mode for storefront
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['products', 'infinite', baseFilters, limit],
    queryFn: ({ pageParam = 1 }) => fetchProductsPage({ page: pageParam, limit, ...baseFilters }),
    getNextPageParam: (lastPage) => lastPage.pagination.hasNextPage ? (lastPage.pagination.page ?? 1) + 1 : undefined,
    initialPageParam: 1,
    enabled: infinite,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })

  // Regular mode for admin
  const queryKey = useMemo(
    () => ['products', selectedCategory, page, limit, featured, onSale, search, sortBy, priceRange],
    [selectedCategory, page, limit, featured, onSale, search, sortBy, priceRange]
  )

  const regularQuery = useQuery({
    queryKey,
    queryFn: () => fetchProductsPage({ page, limit, ...baseFilters }),
    placeholderData: (previousData) => previousData,
    enabled: !infinite,
  })

  const activeQuery = infinite ? infiniteQuery : regularQuery
  const { isLoading, isFetching, error } = activeQuery

  const products = infinite
    ? (infiniteQuery.data?.pages.flatMap(p => p.products) ?? [])
    : (regularQuery.data?.products ?? [])

  const pagination = infinite
    ? (infiniteQuery.data?.pages.at(-1)?.pagination ?? { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false })
    : (regularQuery.data?.pagination ?? { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false })

  const fetchNextPage = infiniteQuery.fetchNextPage
  const hasNextPage = infiniteQuery.hasNextPage
  const isFetchingNextPage = infiniteQuery.isFetchingNextPage

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
    products,
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    pagination,
    page,
    setPage,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
    ...(infinite ? { fetchNextPage, hasNextPage: !!hasNextPage, isFetchingNextPage } : {}),
  }
}
