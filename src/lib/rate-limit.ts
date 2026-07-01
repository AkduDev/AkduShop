interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  interval: number
  maxRequests: number
}

export function rateLimit(
  ip: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  cleanup()

  const key = ip
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.interval,
    })
    return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.interval }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    return vercelForwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

export const AUTH_RATE_LIMIT: RateLimitConfig = {
  interval: 60_000,
  maxRequests: 10,
}

export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  interval: 3_600_000,
  maxRequests: 5,
}
