import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

let _cachedSecret: Uint8Array | null = null

function getSecretKey() {
  if (!_cachedSecret) {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET no está definido en .env')
    _cachedSecret = new TextEncoder().encode(secret)
  }
  return _cachedSecret
}

async function verifyAdminAuth(request: NextRequest): Promise<{ ok: boolean; payload?: Record<string, unknown> }> {
  const token = request.cookies.get('session')?.value
  if (!token) return { ok: false }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const user = payload.user as { role: string } | undefined
    if (!user || !['admin', 'editor', 'viewer'].includes(user.role)) return { ok: false }
    return { ok: true, payload: payload as unknown as Record<string, unknown> }
  } catch {
    return { ok: false }
  }
}

async function verifyCustomerAuth(request: NextRequest): Promise<{ ok: boolean; payload?: Record<string, unknown> }> {
  const token = request.cookies.get('customer_session')?.value
  if (!token) return { ok: false }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const user = payload.user as { role: string } | undefined
    if (!user || user.role !== 'customer') return { ok: false }
    return { ok: true, payload: payload as unknown as Record<string, unknown> }
  } catch {
    return { ok: false }
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
    const result = await verifyCustomerAuth(request)
    if (!result.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  if (pathname.startsWith('/api/products')) {
    if (method === 'GET') return NextResponse.next()
    const result = await verifyAdminAuth(request)
    if (!result.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  if (pathname.startsWith('/api/categories')) {
    if (method === 'GET') return NextResponse.next()
    const result = await verifyAdminAuth(request)
    if (!result.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  if (pathname.startsWith('/api/orders')) {
    if (method === 'GET') {
      const result = await verifyAdminAuth(request)
      if (!result.ok) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      const response = NextResponse.next()
      if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
      return response
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/settings')) {
    if (method === 'GET') return NextResponse.next()
    const result = await verifyAdminAuth(request)
    if (!result.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  const adminOnlyRoutes = ['/api/admin', '/api/seed', '/api/upload', '/api/migrate-images']
  if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
    const result = await verifyAdminAuth(request)
    if (!result.ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  if (pathname === '/api/auth/check') {
    const result = await verifyAdminAuth(request)
    if (!result.ok) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }
    const response = NextResponse.next()
    if (result.payload) response.headers.set('x-verified-session', JSON.stringify(result.payload))
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
