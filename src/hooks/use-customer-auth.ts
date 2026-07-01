'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Customer, CustomerRegisterData, CustomerLoginData } from '@/types'

export interface CustomerProfile extends Customer {}

async function fetchCustomer(): Promise<CustomerProfile | null> {
  const res = await fetch('/api/auth/customer/me')
  if (!res.ok) return null
  return res.json()
}

async function loginCustomer(data: CustomerLoginData): Promise<boolean> {
  const res = await fetch('/api/auth/customer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Error al iniciar sesión')
  }
  return true
}

async function registerCustomer(data: CustomerRegisterData): Promise<boolean> {
  const res = await fetch('/api/auth/customer/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Error al registrarse')
  }
  return true
}

async function logoutCustomer(): Promise<void> {
  await fetch('/api/auth/customer/logout', { method: 'POST' })
}

async function updateProfileApi(data: { name?: string; phone?: string; address?: string; currentPassword?: string; newPassword?: string }): Promise<boolean> {
  const res = await fetch('/api/auth/customer/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Error al actualizar perfil')
  }
  return true
}

export function useCustomerAuth() {
  const queryClient = useQueryClient()

  const { data: customer, isLoading: loading } = useQuery({
    queryKey: ['customer'],
    queryFn: fetchCustomer,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const loginMutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutCustomer,
    onSuccess: () => {
      queryClient.setQueryData(['customer'], null)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; phone?: string; address?: string; currentPassword?: string; newPassword?: string }) =>
      updateProfileApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  const login = async (data: CustomerLoginData): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(data)
      return true
    } catch {
      return false
    }
  }

  const register = async (data: CustomerRegisterData): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(data)
      return true
    } catch {
      return false
    }
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const updateProfile = async (data: { name?: string; phone?: string; address?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      await updateProfileMutation.mutateAsync(data)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar' }
    }
  }

  const checkAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ['customer'] })
  }

  return {
    customer: customer ?? null,
    isLoggedIn: !!customer,
    loading,
    checkAuth,
    login,
    register,
    logout,
    updateProfile,
  }
}
