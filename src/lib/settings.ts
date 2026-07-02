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
  'legalEmail', 'legalPhone', 'legalJurisdiction',
]

let cachedSettings: SiteSettings | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getSettings(): Promise<SiteSettings> {
  if (cachedSettings && Date.now() - cacheTimestamp < CACHE_TTL) return cachedSettings

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
    cacheTimestamp = Date.now()
    return settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function invalidateSettingsCache(): void {
  cachedSettings = null
  cacheTimestamp = 0
}
