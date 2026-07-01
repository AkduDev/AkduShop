import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const orders = await db.order.findMany({
      where: { customerId: session.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(orders)
  } catch (error) {
    logger.error('Error fetching customer orders', 'customer/me/orders', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}
