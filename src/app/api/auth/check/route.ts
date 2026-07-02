import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  
  if (!session || !['admin', 'editor', 'viewer'].includes(session.role)) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }
  
  return NextResponse.json({ 
    isAdmin: true, 
    user: { id: session.id, name: session.name, email: session.email, role: session.role }
  })
}
