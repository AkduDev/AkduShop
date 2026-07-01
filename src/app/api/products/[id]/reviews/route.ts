import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await db.review.findMany({
      where: { productId: id },
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const stats = await db.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        customerName: r.customer.name,
        createdAt: r.createdAt,
      })),
      stats: {
        average: stats._avg.rating ?? 0,
        count: stats._count.rating,
      },
    })
  } catch (error) {
    logger.error('Error fetching reviews', 'products/[id]/reviews', error)
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}
