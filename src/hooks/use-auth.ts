'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchAuthStatus(): Promise<boolean> {
  const res = await fetch('/api/auth/check')
  if (!res.ok) return false
  const data = await res.json()
  return data.isAdmin === true
}

async function loginAdmin(email: string, password: string): Promise<boolean> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) return false
  return true
}

async function logoutAdmin(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: isAdmin = false, isLoading: loading } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchAuthStatus,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginAdmin(email, password),
    onSuccess: () => {
      queryClient.setQueryData(['auth'], true)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.setQueryData(['auth'], false)
    },
  })

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      return await loginMutation.mutateAsync({ email, password })
    } catch {
      return false
    }
  }, [loginMutation])

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const checkAuth = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
  }, [queryClient])

  return {
    isAdmin,
    loading,
    checkAuth,
    login,
    logout,
  }
}
