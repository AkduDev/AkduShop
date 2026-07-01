import { NextRequest, NextResponse } from 'next/server'
import { authenticateCustomer, createSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { rateLimit, getClientIp, AUTH_RATE_LIMIT } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limiter = rateLimit(ip, AUTH_RATE_LIMIT)

    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const customer = await authenticateCustomer(email, password)

    if (!customer) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    const token = await createSession(customer)

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
    logger.error('Customer login error', 'auth/customer/login', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
