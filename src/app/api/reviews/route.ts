import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCustomerSession } from '@/lib/auth'
import { reviewSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const customerSession = await getCustomerSession()

    if (!customerSession) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para dejar una reseña' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { productId, rating, comment } = parsed.data

    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const existingReview = await db.review.findUnique({
      where: {
        productId_customerId: {
          productId,
          customerId: customerSession.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has dejado una reseña para este producto' },
        { status: 409 }
      )
    }

    const review = await db.review.create({
      data: {
        productId,
        customerId: customerSession.id,
        rating,
        comment: comment || null,
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customerName: review.customer.name,
      createdAt: review.createdAt,
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating review', 'reviews', error)
    return NextResponse.json(
      { error: 'Error al crear la reseña' },
      { status: 500 }
    )
  }
}
