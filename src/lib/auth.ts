import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET no está definido en .env') })()
)

const scrypt = promisify(_scrypt)
const SALT_LENGTH = 16
const KEY_LENGTH = 64

export type AdminRole = 'admin' | 'editor' | 'viewer'

export const ADMIN_ROLES: Record<AdminRole, { label: string; permissions: string[] }> = {
  admin: {
    label: 'Administrador',
    permissions: ['read', 'write', 'delete', 'settings', 'users'],
  },
  editor: {
    label: 'Editor',
    permissions: ['read', 'write'],
  },
  viewer: {
    label: 'Visor',
    permissions: ['read'],
  },
}

export function hasPermission(role: string, permission: string): boolean {
  const adminRole = ADMIN_ROLES[role as AdminRole]
  if (!adminRole) return false
  return adminRole.permissions.includes(permission)
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export type CustomerSessionUser = Omit<SessionUser, 'role'> & { role: 'customer' }

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY)
  
  return token
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  return verifySession(token)
}

export async function getCustomerSession(): Promise<CustomerSessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('customer_session')?.value

  if (!token) return null

  const session = await verifySession(token)
  if (!session || session.role !== 'customer') return null

  return session as CustomerSessionUser
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(':')
  if (!saltHex || !keyHex) return false

  const salt = Buffer.from(saltHex, 'hex')
  const derivedKey = await scrypt(password, salt, KEY_LENGTH) as Buffer
  const originalKey = Buffer.from(keyHex, 'hex')

  if (derivedKey.length !== originalKey.length) return false
  return timingSafeEqual(derivedKey, originalKey)
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email }
  })
  
  if (!user) return null

  const isHashedPassword = typeof user.password === 'string' && user.password.includes(':')
  if (!isHashedPassword) return null

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) return null
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerSessionUser | null> {
  const customer = await db.customer.findUnique({
    where: { email }
  })

  if (!customer) return null

  const isValid = await verifyPassword(password, customer.password)
  if (!isValid) return null

  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    role: 'customer',
  }
}
