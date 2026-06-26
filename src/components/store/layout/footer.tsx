'use client'

import { Phone } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-primary border-t border-primary-foreground/10 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary-foreground">
              {settings.siteName}
            </span>
          </div>
          
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} {settings.siteName}. Todos los derechos reservados.
          </p>
          
          <a 
            href={`https://wa.me/${settings.whatsappNumber}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">Contáctanos</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
