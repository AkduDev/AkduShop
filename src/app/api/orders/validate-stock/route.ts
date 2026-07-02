import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateStockSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = validateStockSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { items } = parsed.data
    const productIds = items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${product.name}" ya no tiene stock suficiente (disponible: ${product.stock})` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json(
      { error: 'Error al validar stock' },
      { status: 500 }
    )
  }
}
