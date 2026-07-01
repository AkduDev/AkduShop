'use client'

import { Truck, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

export function TrustBanner() {
  const { settings } = useSettings()

  const items = [
    { icon: Truck, text: settings.shippingText || 'Envío a toda Cuba' },
    { icon: CreditCard, text: 'Pago contra entrega' },
    { icon: MessageCircle, text: 'Atención por WhatsApp' },
    { icon: ShieldCheck, text: 'Compra 100% segura' },
  ]

  return (
    <section className="py-6 border-y border-border/30 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2.5 text-center">
              <item.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
