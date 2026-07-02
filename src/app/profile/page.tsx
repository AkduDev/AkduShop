'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Mail, Phone, MapPin, Pencil, Save, X, Lock, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/hooks/use-toast'
import { ORDER_STATUS_LABELS } from '@/types'
import { StoreLayout } from '@/components/store/layout/store-layout'
import type { Order } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
}

export default function ProfilePage() {
  const router = useRouter()
  const { customer, isLoggedIn, loading, updateProfile } = useCustomerAuth()
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', address: '', currentPassword: '', newPassword: '' })
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/')
    }
  }, [loading, isLoggedIn, router])

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        currentPassword: '',
        newPassword: '',
      })
    }
  }, [customer])

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/auth/customer/me/orders')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch orders')
          return res.json()
        })
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => { setOrders([]); setOrdersError(true) })
        .finally(() => setOrdersLoading(false))
    }
  }, [isLoggedIn])

  const handleReorder = async (order: Order) => {
    if (!order.items) return
    const validItems = order.items.filter(i => i.productId)

    const results = await Promise.allSettled(
      validItems.map(async (item) => {
        try {
          const res = await fetch(`/api/products/${item.productId}`)
          if (res.ok) {
            const product = await res.json()
            return { ...item, imageUrl: product.imageUrl || '/placeholder.svg' }
          }
        } catch {}
        return { ...item, imageUrl: '/placeholder.svg' }
      })
    )

    let addedCount = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const item = result.value
        addItem({
          id: item.productId!,
          name: item.name,
          price: item.unitPrice,
          imageUrl: item.imageUrl,
        })
        addedCount++
      }
    }

    toast({ title: 'Pedido agregado al carrito', description: `${addedCount} producto(s) agregado(s)` })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const data: Record<string, string> = {
      name: form.name,
      phone: form.phone,
      address: form.address,
    }
    if (form.newPassword) {
      data.currentPassword = form.currentPassword
      data.newPassword = form.newPassword
    }
    const result = await updateProfile(data)
    setSaving(false)
    if (result.success) {
      setEditing(false)
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }))
      toast({ title: 'Perfil actualizado', description: 'Tus datos se han guardado correctamente' })
    } else {
      setError(result.error || 'Error al actualizar')
    }
  }

  if (loading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        </div>
      </StoreLayout>
    )
  }

  if (!customer) return null

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Mi Cuenta</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Información Personal</CardTitle>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setError(''); setForm(f => ({ ...f, currentPassword: '', newPassword: '' })) }}>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="border-t border-border/30 pt-4 mt-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Cambiar contraseña (opcional)
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input id="currentPassword" type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input id="newPassword" type="password" minLength={6} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.address}</span>
                  </div>
                )}
                {!customer.phone && !customer.address && (
                  <p className="text-sm text-muted-foreground">Agrega tu teléfono y dirección para facilitar tus pedidos.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mis Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive/50" />
                <p className="text-destructive font-medium">Error al cargar pedidos</p>
                <p className="text-sm text-muted-foreground mt-1">Intenta recargar la página</p>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tienes pedidos aún
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || ''}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/30">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-muted-foreground">
                        Notas: {order.notes}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs mt-2"
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Volver a comprar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  )
}
