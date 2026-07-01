import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { orderStatusSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error fetching order', 'orders/[id]', error)
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = orderStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status } = parsed.data

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error updating order', 'orders/[id]', error)
    return NextResponse.json(
      { error: 'Error al actualizar la orden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await db.order.delete({ where: { id } })

    return NextResponse.json({ message: 'Orden eliminada' })
  } catch (error) {
    logger.error('Error deleting order', 'orders/[id]', error)
    return NextResponse.json(
      { error: 'Error al eliminar la orden' },
      { status: 500 }
    )
  }
}
