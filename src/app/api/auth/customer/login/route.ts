import { NextRequest, NextResponse } from 'next/server'
import { authenticateCustomer, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

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
    console.error('Customer login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
