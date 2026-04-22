'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Trash2, Plus, Minus, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'

interface CartDrawerProps {
  onCheckout: () => void
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, getTotal, getTotalItems, clearCart } = useCartStore()
  const count = getTotalItems()
  
  const handleCheckout = () => {
    onCheckout()
    setOpen(false)
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full border-border/50 hover:border-[var(--gold)] hover:text-[var(--gold)]">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-[var(--gold)] text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              suppressHydrationWarning
            >
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Tu Carrito</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-1">Añade productos para continuar</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
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
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-border/50"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="space-y-4 pt-4">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-bold">${getTotal().toFixed(2)}</span>
              </div>
              
              <SheetFooter className="flex-col gap-3 sm:flex-col">
                <Button 
                  className="w-full h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full text-base"
                  onClick={handleCheckout}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enviar Pedido por WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full border-border/50"
                  onClick={clearCart}
                >
                  <X className="mr-2 h-4 w-4" />
                  Vaciar Carrito
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
