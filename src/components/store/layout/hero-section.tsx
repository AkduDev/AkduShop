'use client'

import { Sparkles, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/settings-context'
import { AnimateOnScroll } from '@/components/store/animate-on-scroll'

export function HeroSection() {
  const { settings } = useSettings()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-muted/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gold-light)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--gold-light)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium tracking-wide text-primary">{settings.heroBadge}</span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Descubre la</span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {settings.heroTitle}
              </span>
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {settings.heroSubtitle}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {settings.heroCtaText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {settings.heroCtaContactText}
              </Button>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={400}>
            <div className="flex items-center justify-center gap-8 mt-14 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Calidad Garantizada</p>
              </div>
              <div className="w-px h-12 bg-border/50" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">Envío</p>
                <p className="text-sm text-muted-foreground mt-1">A toda Cuba</p>
              </div>
              <div className="w-px h-12 bg-border/50" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Valoración 5.0</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
