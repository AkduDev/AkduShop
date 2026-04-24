import { useCallback } from 'react'
import { useCartStore } from '@/store/cart'

export function useCartCheckout() {
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)

  const handleWhatsAppCheckout = useCallback(() => {
    const phoneNumber = '5354133253'
    
    const itemsList = items
      .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n')
    
    const message = `¡Hola! Estoy interesado en los siguientes productos de Carteras Lesly:

${itemsList}

Total: $${getTotal().toFixed(2)}

¡Gracias!`
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }, [items, getTotal])

  return {
    handleWhatsAppCheckout
  }
}
