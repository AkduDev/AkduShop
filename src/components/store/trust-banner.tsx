'use client'

import { Truck, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

export function TrustBanner() {
  const { settings } = useSettings()

  const items = [
    { icon: Truck, text: settings.shippingText || 'Envío a toda Cuba', highlight: true },
    { icon: CreditCard, text: 'Pago contra entrega' },
    { icon: MessageCircle, text: 'Atención por WhatsApp' },
    { icon: ShieldCheck, text: 'Compra 100% segura' },
  ]

  return (
    <section className="py-8 border-y border-border/30 dark:border-border/20 bg-muted/30 dark:bg-surface-1/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 text-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                item.highlight
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
