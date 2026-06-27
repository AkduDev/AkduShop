import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

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

    const inventoryResult = await db.$queryRaw<[{ inventoryValue: number }]>`
      SELECT COALESCE(SUM("price" * "stock"), 0) as "inventoryValue" FROM "Product"
    `
    const inventoryValue = Number(inventoryResult[0]?.inventoryValue ?? 0)

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
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
