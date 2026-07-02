import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

function getSecretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está definido en .env')
  return new TextEncoder().encode(secret)
}

async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('session')?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const user = payload.user as { role: string } | undefined
    return !!user && ['admin', 'editor', 'viewer'].includes(user.role)
  } catch {
    return false
  }
}

async function verifyCustomerAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('customer_session')?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const user = payload.user as { role: string } | undefined
    return !!user && user.role === 'customer'
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/auth/login') || pathname === '/api/auth/customer/login' || pathname === '/api/auth/customer/register' || pathname === '/api/auth/customer/logout') {
    return NextResponse.next()
  }

  if (pathname === '/api/auth/customer/me') {
    const isCustomer = await verifyCustomerAuth(request)
    if (!isCustomer) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/products')) {
    if (method === 'GET') return NextResponse.next()
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/categories')) {
    if (method === 'GET') return NextResponse.next()
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/orders')) {
    if (method === 'GET') {
      const isAdmin = await verifyAdminAuth(request)
      if (!isAdmin) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/settings')) {
    if (method === 'GET') return NextResponse.next()
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  const adminOnlyRoutes = ['/api/admin', '/api/seed', '/api/upload', '/api/migrate-images']
  if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname === '/api/auth/check') {
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
