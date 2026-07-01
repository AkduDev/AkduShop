import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const [
      totalProducts,
      totalCategories,
      totalStock,
      lowStockProducts,
      featuredProducts,
      onSaleProducts,
    ] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.product.aggregate({
        _sum: { stock: true }
      }),
      db.product.count({
        where: {
          stock: { lt: 5 }
        }
      }),
      db.product.count({
        where: { featured: true }
      }),
      db.product.count({
        where: { onSale: true }
      }),
    ])

    const productsForValue = await db.product.findMany({
      select: { price: true, stock: true },
    })
    const inventoryValue = productsForValue.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    )

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalStock: totalStock._sum.stock || 0,
      lowStockProducts,
      featuredProducts,
      onSaleProducts,
      inventoryValue
    })
  } catch (error) {
    logger.error('Error fetching dashboard stats', 'admin/stats', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
