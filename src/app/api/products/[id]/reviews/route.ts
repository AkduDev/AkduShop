import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const skip = (page - 1) * limit

    const [reviews, stats] = await Promise.all([
      db.review.findMany({
        where: { productId: id },
        include: {
          customer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.aggregate({
        where: { productId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])

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
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' }
    })
  } catch (error) {
    logger.error('Error fetching reviews', 'products/[id]/reviews', error)
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}
