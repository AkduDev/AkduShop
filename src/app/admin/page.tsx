'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'

const AdminPanel = dynamic(
  () => import('@/components/store/admin-panel-refactored').then((m) => m.AdminPanel),
  { ssr: false }
)

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const { fetchProducts } = useProducts()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && !isAdmin) {
      router.push('/')
    }
  }, [mounted, authLoading, isAdmin, router])

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--gold)] border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminPanel onProductChange={() => fetchProducts()} />
    </div>
  )
}