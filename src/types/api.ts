export interface PaginationData {
  page?: number
  limit?: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

import type { Product } from './product'

export interface ProductsResponse {
  products: Product[]
  pagination: PaginationData
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalStock: number
  lowStockProducts: number
  featuredProducts: number
  onSaleProducts: number
  inventoryValue: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export interface UploadResponse {
  url: string
  fileName: string
  size: number
}

export interface SiteSettings {
  siteName: string
  siteTagline: string
  siteDescription: string
  currency: string
  currencySymbol: string
  whatsappNumber: string
  address: string
  schedule: string
  scheduleNote: string
  heroTitle: string
  heroSubtitle: string
  heroBadge: string
  primaryColor: string
  logoUrl: string
  faviconUrl: string
  featuredTitle: string
  shippingText: string
  searchPlaceholder: string
  heroCtaText: string
  heroCtaContactText: string
  contactTitle: string
  contactSubtitle: string
  cartTitle: string
  noProductsText: string
  noSearchResultsText: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Mi Tienda',
  siteTagline: 'Tu tienda de confianza',
  siteDescription: 'Los mejores productos al mejor precio',
  currency: 'USD',
  currencySymbol: '$',
  whatsappNumber: '0000000000',
  address: 'Tu dirección aquí',
  schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
  scheduleNote: 'Fines de semana con cita previa',
  heroTitle: 'Bienvenido a tu tienda',
  heroSubtitle: 'Descubre productos increíbles para ti',
  heroBadge: 'Nuevos productos',
  primaryColor: '#3b82f6',
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
  featuredTitle: 'Productos Destacados',
  shippingText: 'Envío a toda Cuba',
  searchPlaceholder: 'Buscar productos...',
  heroCtaText: 'Explorar Colección',
  heroCtaContactText: 'Contáctanos',
  contactTitle: 'Visítanos',
  contactSubtitle: 'Te invitamos a conocer nuestra tienda y descubrir la calidad de nuestros productos',
  cartTitle: 'Tu Carrito',
  noProductsText: 'No hay productos en esta categoría',
  noSearchResultsText: 'No se encontraron productos para',
}
