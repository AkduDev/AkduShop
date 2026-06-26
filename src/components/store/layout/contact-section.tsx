'use client'

import { MapPin, Clock, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useSettings } from '@/lib/settings-context'

export function ContactSection() {
  const { settings } = useSettings()

  return (
    <section id="contacto" className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">{settings.contactTitle}</h3>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            {settings.contactSubtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                <MapPin className="h-7 w-7 text-[var(--gold)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Dirección</h4>
              <p className="text-primary-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                {settings.address}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                <Clock className="h-7 w-7 text-[var(--gold)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Horario</h4>
              <p className="text-primary-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                {settings.schedule}
                {settings.scheduleNote && (
                  <>
                    <br />
                    <span className="text-[var(--gold)]">{settings.scheduleNote}</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                <Phone className="h-7 w-7 text-[var(--gold)]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-primary-foreground">WhatsApp</h4>
              <a 
                href={`https://wa.me/${settings.whatsappNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--gold)] hover:underline text-lg font-medium"
              >
                {settings.whatsappNumber}
              </a>
              <p className="text-primary-foreground/50 text-xs mt-2">
                Respuesta inmediata
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
