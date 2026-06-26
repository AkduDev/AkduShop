'use client'

import { useCallback, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useSettings } from '@/lib/settings-context'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { useToast } from '@/hooks/use-toast'

export function useCartCheckout() {
  const [submitting, setSubmitting] = useState(false)
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)
  const { settings } = useSettings()
  const { customer } = useCustomerAuth()
  const { toast } = useToast()

  const handleWhatsAppCheckout = useCallback(async () => {
    if (items.length === 0) return
    if (!customer) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: undefined,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      })

      if (!res.ok) throw new Error('Error al crear la orden')

      const itemsList = items
        .map(item => `• ${item.name} x${item.quantity} - ${settings.currencySymbol}${(item.price * item.quantity).toFixed(2)}`)
        .join('\n')

      let message = `¡Hola! Soy ${customer.name} y estoy interesado en los siguientes productos de ${settings.siteName}:\n\n${itemsList}\n\n`
      message += `\nTotal: ${settings.currencySymbol}${getTotal().toFixed(2)}\n\n¡Gracias!`

      const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      clearCart()
      toast({
        title: 'Pedido enviado',
        description: 'Tu pedido se ha registrado correctamente',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Error al enviar el pedido. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [items, getTotal, clearCart, settings, customer, toast])

  return {
    handleWhatsAppCheckout,
    submitting,
  }
}
