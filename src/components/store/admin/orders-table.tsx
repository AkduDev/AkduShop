'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, ChevronDown, MessageCircle, ChevronLeft, ChevronRight, Search, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'
import { useSettings } from '@/lib/settings-context'
import type { Order, OrderStatus } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface OrdersTableProps {
  onStatusChange?: (id: string, status: OrderStatus) => Promise<void>
}

interface PaginatedOrders {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'shipped', label: 'Enviadas' },
  { value: 'delivered', label: 'Entregadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export function OrdersTable({ onStatusChange }: OrdersTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { settings } = useSettings()

  const { data, isLoading, error } = useQuery<PaginatedOrders>({
    queryKey: ['orders', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Error al cargar órdenes')
      return res.json()
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      return { id, status }
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', page, statusFilter] })
      const previous = queryClient.getQueryData<PaginatedOrders>(['orders', page, statusFilter])
      queryClient.setQueryData<PaginatedOrders>(['orders', page, statusFilter], (old) => {
        if (!old) return old
        return {
          ...old,
          orders: old.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }
      })
      return { previous }
    },
    onSuccess: () => {
      toast({ title: 'Estado actualizado correctamente' })
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['orders', page, statusFilter], context.previous)
      }
      toast({ title: 'Error al actualizar el estado', variant: 'destructive' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const handleStatusChange = (id: string, status: OrderStatus) => {
    statusMutation.mutate({ id, status })
    onStatusChange?.(id, status)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando órdenes...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>
          Reintentar
        </Button>
      </div>
    )
  }

  const orders = data?.orders ?? []
  const pagination = data?.pagination

  const filteredOrders = search
    ? orders.filter(o =>
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone?.includes(search) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  if (orders.length === 0 && !search && statusFilter === 'all') {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-xl text-muted-foreground">No hay órdenes todavía</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Las órdenes aparecerán aquí cuando los clientes realicen pedidos
        </p>
      </div>
    )
  }

  const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered']

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(f => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Contacto</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Items</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <>
                <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <td className="py-3 px-4">
                    <div className="font-medium">{order.customerName}</div>
                    {order.notes && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{order.notes}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="text-muted-foreground">
                      {order.customerPhone && (
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle className="h-3 w-3" />
                          {order.customerPhone}
                        </a>
                      )}
                      {order.customerAddress && (
                        <div className="text-xs mt-0.5">{order.customerAddress}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {settings.currencySymbol}{order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 gap-1 border-border/50">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[order.status]}`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statusFlow.map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className={order.status === status ? 'bg-muted' : ''}
                            >
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[status]}`}>
                                {ORDER_STATUS_LABELS[status]}
                              </span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            className="text-destructive"
                          >
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS.cancelled}`}>
                              {ORDER_STATUS_LABELS.cancelled}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                </tr>
                {expandedOrder === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={6} className="px-4 pb-3">
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Items de la orden:</p>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{item.name} × {item.quantity}</span>
                            <span className="text-muted-foreground">{settings.currencySymbol}{(item.unitPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-border/30">
                          <span>Total</span>
                          <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3 p-3 max-h-[500px] overflow-y-auto">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Status bar */}
            <div className={`px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
              order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
              order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
              order.status === 'shipped' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400' :
              order.status === 'delivered' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
              'bg-red-500/10 text-red-700 dark:text-red-400'
            }`}>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="opacity-70">
                {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="p-3 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate text-foreground">{order.customerName}</div>
                  {order.customerPhone && (
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors mt-0.5"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {order.customerPhone}
                    </a>
                  )}
                  {order.customerAddress && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{order.customerAddress}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-foreground">{settings.currencySymbol}{order.total.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>

              {order.notes && (
                <p className="text-[11px] text-muted-foreground/70 italic line-clamp-1 border-l-2 border-primary/20 pl-2">
                  {order.notes}
                </p>
              )}

              {/* Expandable order items */}
              {expandedOrder === order.id && (
                <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground">Items:</p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{item.name} × {item.quantity}</span>
                      <span className="text-muted-foreground">{settings.currencySymbol}{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-border/30 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 gap-1.5 border-border/50 text-xs"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? 'Ocultar' : 'Ver items'}
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border/50 text-xs">
                      Estado
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {statusFlow.map(status => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(order.id, status)}
                        className={order.status === status ? 'bg-muted' : ''}
                      >
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS[status]}`}>
                          {ORDER_STATUS_LABELS[status]}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="text-destructive"
                    >
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ORDER_STATUS_COLORS.cancelled}`}>
                        {ORDER_STATUS_LABELS.cancelled}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {pagination.total} órdenes en total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
