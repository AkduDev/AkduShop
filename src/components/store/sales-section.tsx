'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Tag, Zap, Clock, Flame } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import { AnimateOnScroll } from '@/components/store/animate-on-scroll'
import type { Product } from '@/types'

interface SalesSectionProps {
  products: Product[]
  onViewDetails: (product: Product) => void
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      let { hours, minutes, seconds } = prev
      if (seconds > 0) {
        seconds--
      } else if (minutes > 0) {
        minutes--
        seconds = 59
      } else if (hours > 0) {
        hours--
        minutes = 59
        seconds = 59
      } else {
        hours = 23
        minutes = 59
        seconds = 59
      }
      return { hours, minutes, seconds }
    })
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tick])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-xl border border-red-500/20 px-4 py-2">
      <Clock className="h-4 w-4 text-red-500" />
      <span className="text-sm text-muted-foreground">Termina en:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-red-500">
        <span className="bg-red-500/10 px-2 py-0.5 rounded text-sm">{pad(timeLeft.hours)}</span>
        <span>:</span>
        <span className="bg-red-500/10 px-2 py-0.5 rounded text-sm">{pad(timeLeft.minutes)}</span>
        <span>:</span>
        <span className="bg-red-500/10 px-2 py-0.5 rounded text-sm">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  )
}

export function SalesSection({ products, onViewDetails }: SalesSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="py-12 bg-gradient-to-b from-red-500/5 via-transparent to-transparent">
      <div className="container mx-auto px-4">
        <AnimateOnScroll>
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent via-red-500/30 to-red-500/60" />
              <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500">
                  Ofertas Imperdibles
                </h3>
                <Zap className="h-5 w-5 text-red-500 animate-bounce" />
              </div>
              <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent via-red-500/30 to-red-500/60" />
            </div>

            <CountdownTimer />
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {products.slice(0, 8).map((product, index) => (
            <AnimateOnScroll key={product.id} delay={index * 100}>
              <ProductCard
                product={product}
                onViewDetails={onViewDetails}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
