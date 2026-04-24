import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Obtener todos los productos
export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Transformar para mantener compatibilidad con el frontend
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category.name,
      categoryId: p.categoryId,
      stock: p.stock,
      featured: p.featured,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }))
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo producto (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        stock: parseInt(data.stock) || 0,
        featured: data.featured || false
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
      imageUrl: product.imageUrl,
      category: product.category.name,
      categoryId: product.categoryId,
      stock: product.stock,
      featured: product.featured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
