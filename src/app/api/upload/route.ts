import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
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
    const buffer = Buffer.from(await file.arrayBuffer())

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (blobToken) {
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
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/products/${fileName}`,
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
