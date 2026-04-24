'use client'

import { Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--champagne)] via-background to-[var(--champagne)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gold-light)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--gold-light)_0%,_transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-[var(--gold)]/30 mb-6">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span className="text-sm font-medium tracking-wide">Nueva Colección 2026</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Descubre la
            <span className="block mt-2 bg-gradient-to-r from-primary via-[var(--gold)] to-primary bg-clip-text text-transparent">
              Elegancia Definida
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Selección de carteras originales de marcas premium.
            Diseños únicos que combinan sofisticación y calidad garantizada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full px-8 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorar Colección
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 border-[var(--gold)]/50 hover:bg-[var(--gold)]/10"
              onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contáctanos
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Cuero Genuino</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Clientes Felices</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Valoración</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
