import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, productId } = body as { email: string; productId: string }

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email y productId son requeridos' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    if (product.stock > 0) {
      return NextResponse.json(
        { error: 'El producto ya está disponible' },
        { status: 400 }
      )
    }

    const existing = await db.stockAlert.findUnique({
      where: { email_productId: { email, productId } },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Ya estás registrado para esta notificación' },
        { status: 200 }
      )
    }

    await db.stockAlert.create({
      data: { email, productId },
    })

    return NextResponse.json(
      { message: 'Te notificaremos cuando el producto esté disponible' },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating stock alert', 'stock-alert', error)
    return NextResponse.json(
      { error: 'Error al crear alerta de stock' },
      { status: 500 }
    )
  }
}
