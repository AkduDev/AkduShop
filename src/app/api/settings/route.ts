import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hasPermission } from '@/lib/auth'
import { getSettings, invalidateSettingsCache } from '@/lib/settings'
import { DEFAULT_SETTINGS, SiteSettings } from '@/types'
import { settingsSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
  })
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session || !hasPermission(session.role, 'settings')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const allowedKeys = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]

    const upserts = allowedKeys.map((key) => {
      const value = parsed.data[key]
      if (value === undefined) return null

      return db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }).filter(Boolean)

    await Promise.all(upserts)
    invalidateSettingsCache()

    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    logger.error('Error updating settings', 'settings', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
