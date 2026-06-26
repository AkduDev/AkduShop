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

    // Obtener estadísticas
    const [
      totalProducts,
      totalCategories,
      totalStock,
      lowStockProducts,
      featuredProducts,
      products
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
      db.product.findMany({
        select: {
          price: true,
          stock: true
        }
      })
    ])

    // Calcular valor del inventario
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalStock: totalStock._sum.stock || 0,
      lowStockProducts,
      featuredProducts,
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
