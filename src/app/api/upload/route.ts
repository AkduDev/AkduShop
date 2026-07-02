import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasPermission } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !hasPermission(session.role, 'write')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary no configurado.' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Debe ser imagen' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'akdushop/products', resource_type: 'image' },
        (error: unknown, result: unknown) => {
          if (error) {
            const errStr = typeof error === 'string' ? error : JSON.stringify(error)
            logger.error('Cloudinary stream error', 'upload', errStr)
            reject(new Error(errStr))
          } else {
            resolve(result as Record<string, unknown>)
          }
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      fileName: String(result.public_id || '').split('/').pop() || '',
      size: file.size
    }, { status: 201 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Upload error', 'upload', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
