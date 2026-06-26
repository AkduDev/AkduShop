import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getSettings, invalidateSettingsCache } from '@/lib/settings'
import { DEFAULT_SETTINGS, SiteSettings } from '@/types'

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const allowedKeys = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]

    const upserts = allowedKeys.map((key) => {
      const value = body[key]
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
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
