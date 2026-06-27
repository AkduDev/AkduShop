import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { rateLimit, getClientIp, REGISTER_RATE_LIMIT } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limiter = rateLimit(ip, REGISTER_RATE_LIMIT)

    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Demasiados registros. Intenta de nuevo más tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, address, password } = parsed.data

    const existing = await db.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const customer = await db.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        password: hashedPassword,
      },
    })

    const token = await createSession({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
    })

    const response = NextResponse.json({
      success: true,
      user: { id: customer.id, name: customer.name, email: customer.email, role: 'customer' },
    })

    response.cookies.set('customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error('Customer register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
