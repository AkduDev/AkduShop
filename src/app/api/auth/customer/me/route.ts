import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
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
    console.error('Error fetching customer profile:', error)
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
    const { name, phone, address, currentPassword, newPassword } = body

    const customer = await db.customer.findUnique({
      where: { id: session.id },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Contraseña actual requerida para cambiar contraseña' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, customer.password)
      if (!valid) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
      }
    }

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10)

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
    console.error('Error updating customer profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
