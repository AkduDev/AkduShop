import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Obtener un producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.imageUrl,
      category: product.category.name,
      categoryId: product.categoryId,
      stock: product.stock,
      featured: product.featured,
      onSale: product.onSale,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const data = await request.json()
    
    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        stock: parseInt(data.stock) || 0,
        featured: data.featured || false,
        onSale: data.onSale || false
      },
      include: {
        category: true
      }
    })
    
    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.imageUrl,
      category: product.category.name,
      categoryId: product.categoryId,
      stock: product.stock,
      featured: product.featured,
      onSale: product.onSale,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    await db.product.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
