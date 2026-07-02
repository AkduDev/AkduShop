export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customerId: string | null
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
  pending: 'bg-yellow-500/20 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-500/40',
  confirmed: 'bg-blue-500/20 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40',
  shipped: 'bg-purple-500/20 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/40',
  delivered: 'bg-green-500/20 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 dark:border-green-500/40',
  cancelled: 'bg-red-500/20 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 dark:border-red-500/40',
}
