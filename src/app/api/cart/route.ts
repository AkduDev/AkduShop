import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { customerId: session.id },
      select: {
        quantity: true,
        product: {
          select: {
            id: true, name: true, price: true, discountPrice: true,
            imageUrl: true, categoryId: true, stock: true,
            featured: true, onSale: true,
            category: { select: { name: true } },
          },
        },
      },
    })

    const items = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      discountPrice: item.product.discountPrice != null ? Number(item.product.discountPrice) : null,
      imageUrl: item.product.imageUrl,
      category: item.product.category.name,
      categoryId: item.product.categoryId,
      stock: item.product.stock,
      featured: item.product.featured,
      onSale: item.product.onSale,
      quantity: item.quantity,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    logger.error('Error fetching cart', 'cart', error)
    return NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body as { productId: string; quantity?: number }

    if (!productId) {
      return NextResponse.json({ error: 'productId es requerido' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    await db.cartItem.upsert({
      where: { customerId_productId: { customerId: session.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { customerId: session.id, productId, quantity },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error adding to cart', 'cart', error)
    return NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      await db.cartItem.deleteMany({
        where: { customerId: session.id, productId },
      })
    } else {
      await db.cartItem.deleteMany({
        where: { customerId: session.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error clearing cart', 'cart', error)
    return NextResponse.json({ error: 'Error al vaciar carrito' }, { status: 500 })
  }
}
