import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

const adminApiRoutes = [
  '/api/products',
  '/api/categories',
  '/api/orders',
  '/api/admin',
  '/api/settings',
  '/api/seed',
  '/api/upload',
  '/api/migrate-images',
]

function isAdminApiRoute(pathname: string): boolean {
  return adminApiRoutes.some((route) => pathname.startsWith(route))
}

function isAuthCheckRoute(pathname: string): boolean {
  return pathname === '/api/auth/check'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/customer')) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (isAdminApiRoute(pathname) || isAuthCheckRoute(pathname)) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      const user = payload.user as { role: string } | undefined

      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
