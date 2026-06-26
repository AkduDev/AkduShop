export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customerName: string
  customerPhone: string | null
  customerAddress: string | null
  notes: string | null
  status: OrderStatus
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  name: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderInput {
  customerName: string
  customerPhone?: string
  customerAddress?: string
  notes?: string
  items: {
    productId?: string
    name: string
    quantity: number
    unitPrice: number
  }[]
}

export interface UpdateOrderInput {
  status: OrderStatus
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
}
