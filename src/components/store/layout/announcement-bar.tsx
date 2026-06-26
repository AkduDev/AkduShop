'use client'

import { useState, useEffect } from 'react'
import { X, Truck, MessageCircle } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

export function AnnouncementBar() {
  const { settings } = useSettings()
  const [visible, setVisible] = useState(true)
  const [current, setCurrent] = useState(0)

  const messages = [
    { icon: Truck, text: settings.shippingText },
    { icon: MessageCircle, text: '¿Dudas? Escríbenos por WhatsApp' },
  ]

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [messages.length])

  if (!visible) return null

  const { icon: Icon, text } = messages[current]

  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-medium truncate">{text}</span>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
