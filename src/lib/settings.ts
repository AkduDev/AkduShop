import { db } from '@/lib/db'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types'

const SETTINGS_KEYS: (keyof SiteSettings)[] = [
  'siteName', 'siteTagline', 'siteDescription',
  'currency', 'currencySymbol', 'whatsappNumber',
  'address', 'schedule', 'scheduleNote',
  'heroTitle', 'heroSubtitle', 'heroBadge',
  'primaryColor', 'logoUrl', 'faviconUrl',
  'featuredTitle', 'shippingText', 'searchPlaceholder',
  'heroCtaText', 'heroCtaContactText',
  'contactTitle', 'contactSubtitle', 'cartTitle',
  'noProductsText', 'noSearchResultsText',
]

let cachedSettings: SiteSettings | null = null

export async function getSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings

  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: SETTINGS_KEYS } },
    })

    const map = new Map(rows.map((r) => [r.key, r.value]))

    const settings = { ...DEFAULT_SETTINGS }
    for (const key of SETTINGS_KEYS) {
      const val = map.get(key)
      if (val !== undefined) {
        (settings as Record<string, string>)[key] = val
      }
    }

    cachedSettings = settings
    return settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function invalidateSettingsCache(): void {
  cachedSettings = null
}
