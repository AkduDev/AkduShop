'use client'

import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-3">{settings.siteName}</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {settings.siteDescription}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary-foreground/80">Enlaces</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#productos" className="hover:text-primary-foreground transition-colors">Productos</a></li>
              <li><a href="#contacto" className="hover:text-primary-foreground transition-colors">Contacto</a></li>
              <li><a href="/profile" className="hover:text-primary-foreground transition-colors">Mi Cuenta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary-foreground/80">Contacto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{settings.schedule}</span>
              </li>
              {settings.scheduleNote && (
                <li className="text-xs text-primary-foreground/50 ml-6">{settings.scheduleNote}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {settings.siteName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors text-sm font-medium"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
