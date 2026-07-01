import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12))
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const onSale = searchParams.get('onSale')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'default'
    const priceRange = searchParams.get('priceRange') || 'all'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (onSale === 'true') {
      where.onSale = true
      where.stock = { gt: 0 }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (priceRange !== 'all') {
      const priceField = 'price'
      switch (priceRange) {
        case '0-10':
          where[priceField] = { lte: 10 }
          break
        case '10-25':
          where[priceField] = { gt: 10, lte: 25 }
          break
        case '25-50':
          where[priceField] = { gt: 25, lte: 50 }
          break
        case '50-100':
          where[priceField] = { gt: 50, lte: 100 }
          break
        case '100+':
          where[priceField] = { gt: 100 }
          break
      }
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'featured':
        orderBy = { featured: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
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
    logger.error('Error fetching products', 'products', error)
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
    logger.error('Error creating product', 'products', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
