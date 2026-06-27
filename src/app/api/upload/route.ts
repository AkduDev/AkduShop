import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'

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

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN no está configurado. Linka el Blob Store en Vercel Dashboard → Settings → Environment Variables')
      return NextResponse.json(
        { error: 'Storage no configurado. Ve a Vercel Dashboard → akdushop → Settings → Blob y linka el store.' },
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

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'Formato de imagen no válido. Usa JPG, PNG, GIF o WEBP' },
        { status: 400 }
      )
    }

    const fileName = `${crypto.randomUUID()}.${extension}`

    const { put } = await import('@vercel/blob')
    const blob = await put(`products/${fileName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      fileName: fileName,
      size: file.size
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
