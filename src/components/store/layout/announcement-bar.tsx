'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Truck, MessageCircle } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

const DISMISS_KEY = 'announcement-dismissed'

export function AnnouncementBar() {
  const { settings } = useSettings()
  const [visible, setVisible] = useState(true)
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)

  const messages = useMemo(() => [
    { icon: Truck, text: settings.shippingText },
    { icon: MessageCircle, text: '¿Dudas? Escríbenos por WhatsApp' },
  ], [settings.shippingText])

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) setVisible(false)
    } catch {}
  }, [])

  useEffect(() => {
    if (messages.length <= 1 || !visible) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [messages.length, visible])

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    }, 200)
  }

  if (!visible) return null

  const { icon: Icon, text } = messages[current]

  return (
    <div className={`bg-primary text-primary-foreground relative overflow-hidden transition-all duration-200 ${exiting ? 'h-0 py-0 opacity-0' : ''}`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium truncate">{text}</span>
        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1 rounded-full hover:bg-primary-foreground/10"
          aria-label="Cerrar anuncio"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
