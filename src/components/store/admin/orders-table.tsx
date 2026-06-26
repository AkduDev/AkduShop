'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, ChevronDown, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'
import type { Order, OrderStatus } from '@/types'

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

export function OrdersTable({ onStatusChange }: OrdersTableProps) {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<PaginatedOrders>({
    queryKey: ['orders', page],
    queryFn: async () => {
      const res = await fetch(`/api/orders?page=${page}&limit=20`)
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
      await queryClient.cancelQueries({ queryKey: ['orders', page] })
      const previous = queryClient.getQueryData<PaginatedOrders>(['orders', page])
      queryClient.setQueryData<PaginatedOrders>(['orders', page], (old) => {
        if (!old) return old
        return {
          ...old,
          orders: old.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['orders', page], context.previous)
      }
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

  if (orders.length === 0) {
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Contacto</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium">{order.customerName}</div>
                  {order.notes && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{order.notes}</div>
                  )}
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <div className="text-muted-foreground">
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[var(--gold)] transition-colors"
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
                  ${order.total.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
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
                <td className="py-3 px-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
