import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hasPermission } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true, name: true, price: true, discountPrice: true,
            imageUrl: true, stock: true, featured: true, onSale: true,
            categoryId: true, createdAt: true,
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    logger.error('Error fetching category', 'categories/[id]', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !hasPermission(session.role, 'write')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = categorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        imageUrl: data.imageUrl || null
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    logger.error('Error updating category', 'categories/[id]', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !hasPermission(session.role, 'delete')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const productsCount = await db.product.count({
      where: { categoryId: id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría que tiene productos' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting category', 'categories/[id]', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
