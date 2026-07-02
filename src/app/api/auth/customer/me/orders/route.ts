import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { toNumber } from '@/lib/product-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { customerId: session.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where: { customerId: session.id } }),
    ])

    return NextResponse.json({
      orders: orders.map(order => ({
        ...order,
        total: toNumber(order.total),
        items: order.items.map(item => ({
          ...item,
          unitPrice: toNumber(item.unitPrice),
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    logger.error('Error fetching customer orders', 'customer/me/orders', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}
