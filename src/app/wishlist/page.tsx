'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountPrice != null ? item.discountPrice : item.price,
      imageUrl: item.imageUrl,
    })
    removeItem(item.id)
    toast({ title: 'Agregado al carrito', description: item.name })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Mis Favoritos
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No tienes favoritos aún</p>
            <p className="text-sm text-muted-foreground mt-1">Toca el corazón en cualquier producto para guardarlo aquí</p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] border-primary/20 mb-1">{item.category}</Badge>
                    <h3 className="font-semibold line-clamp-1 text-sm">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.discountPrice != null ? (
                      <>
                        <span className="font-bold text-red-500 text-sm">${item.discountPrice.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through">${item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <Button
                    size="sm"
                    className="rounded-full h-8 text-xs"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full h-8 text-xs text-destructive hover:text-destructive"
                    onClick={() => {
                      removeItem(item.id)
                      toast({ title: 'Eliminado de favoritos', description: item.name })
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
