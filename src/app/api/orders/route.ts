import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, getCustomerSession, hasPermission } from '@/lib/auth'
import { createOrderSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { toNumber } from '@/lib/product-utils'
import { rateLimitWrite, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimitWrite(ip)
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
    }

    const customerSession = await getCustomerSession()

    if (!customerSession) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para realizar un pedido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { notes, items } = parsed.data

    const productIds = items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, discountPrice: true, onSale: true, stock: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    const validatedItems: { productId: string; name: string; quantity: number; unitPrice: number }[] = []
    let total = 0

    for (const item of items) {
      const product = productMap.get(item.productId)

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

      const unitPrice = product.onSale && product.discountPrice ? toNumber(product.discountPrice) : toNumber(product.price)
      total += unitPrice * item.quantity

      validatedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
      })
    }

    const customer = await db.customer.findUnique({
      where: { id: customerSession.id },
      select: { phone: true, address: true },
    })

    const order = await db.$transaction(async (tx) => {
      for (const item of validatedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        if (updated.count === 0) {
          throw new Error(`Stock insuficiente para "${item.name}"`)
        }
      }

      return tx.order.create({
        data: {
          customerId: customerSession.id,
          customerName: customerSession.name,
          customerPhone: customer?.phone || null,
          customerAddress: customer?.address || null,
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
    })

    return NextResponse.json({
      ...order,
      total: toNumber(order.total),
      items: order.items.map(item => ({
        ...item,
        unitPrice: toNumber(item.unitPrice),
      })),
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating order', 'orders', error)
    const message = error instanceof Error ? error.message : 'Error al crear la orden'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !hasPermission(session.role, 'read')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
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
    logger.error('Error fetching orders', 'orders', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes' },
      { status: 500 }
    )
  }
}
