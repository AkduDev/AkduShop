import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

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
      console.error('Formato Base64 inválido')
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
    console.error('Error convirtiendo Base64 a imagen:', error)
    return null
  }
}

export async function GET() {
  try {
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
          console.log(`✓ Migrado: ${product.name}`)
        } else {
          errors++
          console.error(`✗ Error migrando: ${product.name}`)
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
    console.error('Error en migración:', error)
    return NextResponse.json(
      { error: 'Error durante la migración' },
      { status: 500 }
    )
  }
}
