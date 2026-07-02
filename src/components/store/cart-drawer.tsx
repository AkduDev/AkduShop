'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { ShoppingCart, Trash2, Plus, Minus, MessageCircle, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/store/cart'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { useToast } from '@/hooks/use-toast'
import { CustomerAuthModal } from '@/components/store/customer-auth-modal'

interface CartDrawerProps {
  onCheckout: () => void
}

function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const count = hydrated ? getTotalItems() : 0

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-1 bg-[var(--gold)] text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  )
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const syncWithServer = useCartStore((s) => s.syncWithServer)
  const total = useMemo(() => items.reduce((t, i) => t + i.price * i.quantity, 0), [items])
  const { isLoggedIn } = useCustomerAuth()
  const { toast } = useToast()
  const pendingCheckout = useRef(false)
  const hasSynced = useRef(false)

  useEffect(() => {
    if (isLoggedIn && !hasSynced.current) {
      hasSynced.current = true
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            syncWithServer(data.items)
          }
        })
        .catch(() => {})
    }
    if (!isLoggedIn) {
      hasSynced.current = false
    }
  }, [isLoggedIn, syncWithServer])

  useEffect(() => {
    if (isLoggedIn && pendingCheckout.current) {
      pendingCheckout.current = false
      setAuthModalOpen(false)
      onCheckout()
      setOpen(false)
    }
  }, [isLoggedIn, onCheckout])

  const handleCheckout = () => {
    if (!isLoggedIn) {
      pendingCheckout.current = true
      setAuthModalOpen(true)
      return
    }
    onCheckout()
    setOpen(false)
  }

  const syncToServer = async (action: 'add' | 'remove' | 'clear', productId?: string, quantity?: number) => {
    if (!isLoggedIn) return
    try {
      if (action === 'add' && productId) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        })
      } else if (action === 'remove' && productId) {
        await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' })
      } else if (action === 'clear') {
        await fetch('/api/cart', { method: 'DELETE' })
      }
    } catch {}
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full border-border/50 hover:border-[var(--gold)] hover:text-[var(--gold)]" aria-label="Abrir carrito de compras">
          <ShoppingCart className="h-5 w-5" />
          <CartBadge />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-[90vh] max-h-[90vh]">
        <SheetHeader className="flex items-center justify-between border-b p-4 bg-background sticky top-0 z-10">
          <SheetTitle className="text-2xl">Tu Carrito</SheetTitle>
          {items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                  aria-label="Vaciar carrito"
                >
                  <Trash className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminarán todos los {items.length} producto{items.length !== 1 ? 's' : ''} del carrito. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { clearCart(); syncToServer('clear') }} className="bg-destructive hover:bg-destructive/90">
                    Vaciar carrito
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-1">Añade productos para continuar</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-[var(--gold)] font-medium">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-border/50"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(item.id)
                              syncToServer('remove', item.id)
                              toast({ title: 'Producto eliminado', description: item.name })
                            } else {
                              updateQuantity(item.id, item.quantity - 1)
                              syncToServer('add', item.id, -1)
                            }
                          }}
                          aria-label={`Reducir cantidad de ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium" aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-border/50"
                          onClick={() => {
                            updateQuantity(item.id, item.quantity + 1)
                            syncToServer('add', item.id, 1)
                          }}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            removeItem(item.id)
                            syncToServer('remove', item.id)
                            toast({ title: 'Producto eliminado', description: item.name })
                          }}
                          aria-label={`Eliminar ${item.name} del carrito`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-background/95 backdrop-blur-sm p-4 sticky bottom-0 z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold text-foreground">${total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="col-span-2 h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full text-base"
                    onClick={handleCheckout}
                    aria-label="Enviar pedido por WhatsApp"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Enviar Pedido
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>

      <CustomerAuthModal open={authModalOpen} onOpenChange={(v) => { setAuthModalOpen(v); if (!v) pendingCheckout.current = false }} />
    </Sheet>
  )
}
