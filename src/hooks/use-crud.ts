'use client'

import { useState, useCallback } from 'react'
import { PaginationData } from '@/types'

interface UseCrudOptions {
  endpoint: string
}

interface FetchResult<T> {
  items: T[]
  pagination?: PaginationData
}

export function useCrud<T, CreateData = Partial<T>, UpdateData = CreateData>({
  endpoint
}: UseCrudOptions) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

  const fetchItems = useCallback(async (query?: string) => {
    try {
      setLoading(true)
      setError(null)
      const url = query ? `${endpoint}?${query}` : endpoint
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setItems(data)
        setPagination(null)
      } else {
        const result = data as FetchResult<T>
        const itemsArray = Array.isArray(result.items)
          ? result.items
          : Array.isArray((data as any).products)
          ? (data as any).products
          : Array.isArray((data as any).categories)
          ? (data as any).categories
          : []

        setItems(itemsArray)
        setPagination((data as any).pagination ?? null)
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('useCrud.fetchItems error:', message)
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const createItem = useCallback(async (payload: CreateData): Promise<boolean> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      return response.ok
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('useCrud.createItem error:', message)
      return false
    }
  }, [endpoint])

  const updateItem = useCallback(async (id: string, payload: UpdateData): Promise<boolean> => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      return response.ok
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('useCrud.updateItem error:', message)
      return false
    }
  }, [endpoint])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      return response.ok
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('useCrud.deleteItem error:', message)
      return false
    }
  }, [endpoint])

  return {
    items,
    loading,
    error,
    pagination,
    setItems,
    setPagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
}
