import { useState, useCallback } from 'react'

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' })
      })
      return res.ok
    } catch {
      return false
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (res.ok) {
        setIsAdmin(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAdmin(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }, [])

  return {
    isAdmin,
    setIsAdmin,
    checkAuth,
    login,
    logout
  }
}
