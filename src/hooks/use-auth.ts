'use client'

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
    staleTime: 0,
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      return await loginMutation.mutateAsync({ email, password })
    } catch {
      return false
    }
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const checkAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
  }

  return {
    isAdmin,
    loading,
    checkAuth,
    login,
    logout,
  }
}
