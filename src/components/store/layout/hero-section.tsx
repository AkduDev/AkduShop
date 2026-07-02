'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/settings-context'
import { AnimateOnScroll } from '@/components/store/animate-on-scroll'
import type { Product } from '@/types'

interface HeroSectionProps {
  heroProduct?: Product | null
}

export function HeroSection({ heroProduct }: HeroSectionProps) {
  const { settings } = useSettings()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-muted/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gold-light)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--gold-light)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="max-w-xl">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium tracking-wide text-primary">{settings.heroBadge}</span>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="text-foreground">Descubre la</span>
                <span className="block mt-1 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  {settings.heroTitle}
                </span>
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                {settings.heroSubtitle}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="rounded-full px-7 py-5 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {settings.heroCtaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7 py-5 text-base border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {settings.heroCtaContactText}
                </Button>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={400}>
              <div className="flex items-center gap-6 mt-10 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Calidad</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-primary">Envío</p>
                  <p className="text-xs text-muted-foreground mt-0.5">A toda Cuba</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">5.0</p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {heroProduct && (
            <AnimateOnScroll delay={200}>
              <div className="relative flex items-start justify-center">
                <div className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
                <Link
                  href={`/products/${heroProduct.id}`}
                  className="relative block w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/20 bg-muted hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group"
                  prefetch={false}
                >
                  <Image
                    src={heroProduct.imageUrl}
                    alt={`${heroProduct.name} - Producto destacado`}
                    fill
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 drop-shadow-lg">{heroProduct.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {heroProduct.onSale && heroProduct.discountPrice != null ? (
                        <>
                          <span className="text-lg font-bold text-green-400 drop-shadow-lg">${heroProduct.discountPrice.toFixed(2)}</span>
                          <span className="text-sm text-primary-foreground/60 line-through drop-shadow-lg">${heroProduct.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary-foreground drop-shadow-lg">${heroProduct.price.toFixed(2)}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                      Ver producto <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </div>
    </section>
  )
}
