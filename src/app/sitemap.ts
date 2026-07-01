import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { getSettings } from '@/lib/settings'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings()
  const baseUrl = 'https://akdushop.vercel.app'

  const products = await db.product.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productEntries,
  ]
}
