import Link from 'next/link'
import { Search, Home, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { toNumber } from '@/lib/product-utils'
import { NotFoundIllustration } from '@/components/store/not-found-illustration'

async function getPopularProducts() {
  try {
    const products = await db.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { category: true },
    })
    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: toNumber(p.price),
      discountPrice: p.discountPrice != null ? toNumber(p.discountPrice) : null,
      imageUrl: p.imageUrl,
      category: p.category.name,
      onSale: p.onSale,
    }))
  } catch {
    return []
  }
}

export default async function NotFound() {
  const popularProducts = await getPopularProducts()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-lg">
          <div className="mb-6 flex justify-center">
            <NotFoundIllustration />
          </div>

          <h1 className="text-7xl font-bold text-primary/15 mb-2 select-none">404</h1>
          <h2 className="text-2xl font-bold mb-3">Página no encontrada</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Parece que esta página se mudó o no existe. Te ayudamos a encontrar lo que buscas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <Button asChild className="rounded-full gap-2">
              <Link href="/#productos">
                <ShoppingBag className="h-4 w-4" />
                Ver productos
              </Link>
            </Button>
          </div>

          {popularProducts.length > 0 && (
            <div className="border-t border-border/30 pt-8">
              <p className="text-sm text-muted-foreground mb-4">O prueba estos productos populares:</p>
              <div className="grid grid-cols-2 gap-3">
                {popularProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
