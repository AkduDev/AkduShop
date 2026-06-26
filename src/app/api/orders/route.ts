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

    // Validate prices and stock server-side
    const validatedItems: { productId: string; name: string; quantity: number; unitPrice: number }[] = []
    let total = 0

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Item inválido: productId y quantity requeridos' },
          { status: 400 }
        )
      }

      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, discountPrice: true, onSale: true, stock: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${product.name}": disponible ${product.stock}, solicitado ${item.quantity}` },
          { status: 400 }
        )
      }

      const unitPrice = product.onSale && product.discountPrice ? product.discountPrice : product.price
      total += unitPrice * item.quantity

      validatedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
      })
    }

    const order = await db.order.create({
      data: {
        customerId: customerSession.id,
        customerName: customerSession.name,
        customerPhone: null,
        customerAddress: null,
        notes: notes || null,
        total,
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
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
