import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, getCustomerSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const customerSession = await getCustomerSession()

    if (!customerSession) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para realizar un pedido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notes, items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Productos son requeridos' },
        { status: 400 }
      )
    }

    const total = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    )

    const order = await db.order.create({
      data: {
        customerId: customerSession.id,
        customerName: customerSession.name,
        customerPhone: null,
        customerAddress: null,
        notes: notes || null,
        total,
        items: {
          create: items.map((item: { productId?: string; name: string; quantity: number; unitPrice: number }) => ({
            productId: item.productId || null,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where = status && status !== 'all' ? { status } : {}

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
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
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes' },
      { status: 500 }
    )
  }
}
