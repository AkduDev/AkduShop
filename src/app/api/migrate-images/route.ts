import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

function base64ToImage(base64String: string, fileName: string): string | null {
  try {
    // Extraer el tipo de imagen y los datos
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    
    if (!matches || matches.length !== 3) {
      logger.warn('Formato Base64 inválido', 'migrate-images')
      return null
    }
    
    const imageType = matches[1]
    const base64Data = matches[2]
    const extension = imageType.split('/')[1] || 'jpg'
    
    const fullPath = path.join(UPLOAD_DIR, `${fileName}.${extension}`)
    
    // Convertir Base64 a buffer y guardar
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(fullPath, buffer)
    
    return `/uploads/products/${fileName}.${extension}`
  } catch (error) {
    logger.error('Error convirtiendo Base64 a imagen', 'migrate-images', error)
    return null
  }
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    ensureUploadDir()
    
    const products = await db.product.findMany()
    let migrated = 0
    let skipped = 0
    let errors = 0
    
    for (const product of products) {
      // Si la imageUrl es Base64 (empieza con data:)
      if (product.imageUrl.startsWith('data:')) {
        const fileName = `product-${product.id}-${Date.now()}`
        const newUrl = base64ToImage(product.imageUrl, fileName)
        
        if (newUrl) {
          // Actualizar el producto con la nueva URL
          await db.product.update({
            where: { id: product.id },
            data: { imageUrl: newUrl }
          })
          migrated++
          logger.info(`Migrado: ${product.name}`, 'migrate-images')
        } else {
          errors++
          logger.error(`Error migrando: ${product.name}`, 'migrate-images')
        }
      } else {
        skipped++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migración completada',
      stats: {
        total: products.length,
        migrated,
        skipped,
        errors
      }
    })
  } catch (error) {
    logger.error('Error en migración', 'migrate-images', error)
    return NextResponse.json(
      { error: 'Error durante la migración' },
      { status: 500 }
    )
  }
}
