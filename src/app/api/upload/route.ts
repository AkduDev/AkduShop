import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary env vars missing:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      })
      return NextResponse.json(
        { error: 'Cloudinary no configurado. Faltan variables de entorno.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'akdushop/products'
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}&resource_type=image`
    const crypto = await import('crypto')
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(paramsToSign)
      .digest('hex')

    const uploadForm = new FormData()
    uploadForm.append('file', base64)
    uploadForm.append('api_key', apiKey)
    uploadForm.append('timestamp', String(timestamp))
    uploadForm.append('folder', folder)
    uploadForm.append('resource_type', 'image')
    uploadForm.append('signature', signature)
    uploadForm.append('transformation', 'c_limit,w_1200,h_1200,q_auto,f_auto')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadForm }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', result)
      return NextResponse.json(
        { error: `Cloudinary: ${result.error?.message || JSON.stringify(result)}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: result.secure_url,
      fileName: result.public_id.split('/').pop() || '',
      size: file.size
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      { error: `Error al subir la imagen: ${String(error)}` },
      { status: 500 }
    )
  }
}
