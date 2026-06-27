import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { productSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId')

    const skip = (page - 1) * limit

    const where = categoryId && categoryId !== 'all'
      ? { categoryId }
      : {}

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      imageUrl: p.imageUrl,
      category: p.category.name,
      categoryId: p.categoryId,
      stock: p.stock,
      featured: p.featured,
      onSale: p.onSale,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        discountPrice: data.discountPrice ?? undefined,
        imageUrl: data.imageUrl ?? '',
        categoryId: data.categoryId,
        stock: data.stock ?? 0,
        featured: data.featured ?? false,
        onSale: data.onSale ?? false
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
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
