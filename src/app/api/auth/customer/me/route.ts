import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
import { updateProfileSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const customer = await db.customer.findUnique({
      where: { id: session.id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      orders: customer.orders,
    })
  } catch (error) {
    logger.error('Error fetching customer profile', 'customer/me', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, phone, address, currentPassword, newPassword } = parsed.data

    const customer = await db.customer.findUnique({
      where: { id: session.id },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (newPassword && currentPassword) {
      const valid = await bcrypt.compare(currentPassword, customer.password)
      if (!valid) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
      }
    }

    const updateData: Record<string, string | null> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone ?? null
    if (address !== undefined) updateData.address = address ?? null
    if (newPassword && currentPassword) updateData.password = await bcrypt.hash(newPassword, 10)

    const updated = await db.customer.update({
      where: { id: session.id },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
    })
  } catch (error) {
    logger.error('Error updating customer profile', 'customer/me', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
