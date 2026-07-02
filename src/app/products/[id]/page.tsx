import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { toNumber } from '@/lib/product-utils'
import { ProductPageClient } from './product-page-client'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) return null

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: toNumber(product.price),
    discountPrice: product.discountPrice != null ? toNumber(product.discountPrice) : null,
    imageUrl: product.imageUrl,
    category: product.category.name,
    categoryId: product.categoryId,
    stock: product.stock,
    featured: product.featured,
    onSale: product.onSale,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  const isOnSale = product.onSale && product.discountPrice != null && product.discountPrice < product.price
  const price = isOnSale ? product.discountPrice : product.price

  return {
    title: `${product.name} | AkduShop`,
    description: product.description?.slice(0, 160) || `${product.name} - $${price?.toFixed(2)}`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || `${product.name} - $${price?.toFixed(2)}`,
      images: product.imageUrl ? [{ url: product.imageUrl, width: 800, height: 800 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160) || `${product.name} - $${price?.toFixed(2)}`,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const isOnSale = product.onSale && product.discountPrice != null && product.discountPrice < product.price
  const displayPrice = isOnSale ? product.discountPrice! : product.price

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://akdushop.vercel.app/products/${product.id}`,
    },
    brand: {
      '@type': 'Organization',
      name: 'AkduShop',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  )
}
