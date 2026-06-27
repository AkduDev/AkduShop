import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary no configurado.' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Debe ser imagen' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'akdushop/products', resource_type: 'image' },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary stream error:', JSON.stringify(error))
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      fileName: result.public_id.split('/').pop() || '',
      size: file.size
    }, { status: 201 })

  } catch (error: any) {
    console.error('Upload error:', error?.message || String(error))
    return NextResponse.json(
      { error: error?.message || 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
