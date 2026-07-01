import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession, verifyPassword, hashPassword } from '@/lib/auth'
import { updateProfileSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getCustomerSession()

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const customer = await db.customer.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(customer)
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
      const valid = await verifyPassword(currentPassword, customer.password)
      if (!valid) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
      }
    }

    const updateData: Record<string, string | null> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone ?? null
    if (address !== undefined) updateData.address = address ?? null
    if (newPassword && currentPassword) updateData.password = await hashPassword(newPassword)

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
