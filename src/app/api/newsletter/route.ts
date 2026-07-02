import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { rateLimitWrite, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { success } = await rateLimitWrite(ip)
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = newsletterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const existing = await db.newsletter.findUnique({
      where: { email },
    })

    if (existing) {
      if (!existing.active) {
        await db.newsletter.update({
          where: { email },
          data: { active: true },
        })
        return NextResponse.json({ message: 'Suscripción reactivada' }, { status: 200 })
      }
      return NextResponse.json({ message: 'Ya estás suscrito' }, { status: 200 })
    }

    await db.newsletter.create({
      data: { email },
    })

    return NextResponse.json({ message: 'Suscripción exitosa' }, { status: 201 })
  } catch (error) {
    logger.error('Error subscribing to newsletter', 'newsletter', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}
