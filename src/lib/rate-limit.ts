import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
let authLimiter: Ratelimit | null = null
let registerLimiter: Ratelimit | null = null
let writeLimiter: Ratelimit | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

function getAuthLimiter(): Ratelimit {
  if (!authLimiter) {
    authLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  }
  return authLimiter
}

function getRegisterLimiter(): Ratelimit {
  if (!registerLimiter) {
    registerLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:register',
    })
  }
  return registerLimiter
}

function getWriteLimiter(): Ratelimit {
  if (!writeLimiter) {
    writeLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'ratelimit:write',
    })
  }
  return writeLimiter
}

export interface RateLimitConfig {
  interval: number
  maxRequests: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export async function rateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = config.interval === 60_000
    ? getAuthLimiter()
    : getRegisterLimiter()

  const { success, remaining, reset } = await limiter.limit(ip)

  return {
    success,
    remaining,
    resetAt: reset,
  }
}

export async function rateLimitWrite(ip: string): Promise<RateLimitResult> {
  const { success, remaining, reset } = await getWriteLimiter().limit(ip)
  return { success, remaining, resetAt: reset }
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
