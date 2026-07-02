'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { StoreLayout } from '@/components/store/layout/store-layout'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const handleAddToCart = (item: typeof items[0], keepInWishlist = false) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountPrice != null ? item.discountPrice : item.price,
      imageUrl: item.imageUrl,
    })
    if (!keepInWishlist) removeItem(item.id)
    toast({ title: 'Agregado al carrito', description: item.name })
  }

  const handleAddAllToCart = () => {
    items.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.discountPrice != null ? item.discountPrice : item.price,
        imageUrl: item.imageUrl,
      })
    })
    items.forEach(item => removeItem(item.id))
    toast({ title: `${items.length} productos agregados al carrito` })
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 dark:text-red-400" />
              Mis Favoritos
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-1">{items.length}</Badge>
              )}
            </h1>
          </div>
          {items.length > 1 && (
            <Button onClick={handleAddAllToCart} className="rounded-full gap-2">
              <ShoppingCart className="h-4 w-4" />
              Agregar todo
            </Button>
          )}
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
                <Link href={`/products/${item.id}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity">
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] border-primary/20 mb-1">{item.category}</Badge>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-semibold line-clamp-1 text-sm hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.discountPrice != null ? (
                      <>
                        <span className="font-bold text-red-500 dark:text-red-400 text-sm">${item.discountPrice.toFixed(2)}</span>
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
                    aria-label={`Agregar ${item.name} al carrito`}
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
                    aria-label={`Quitar ${item.name} de favoritos`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
