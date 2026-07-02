'use client'

import { Plus, Minus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export function QuantitySelector({ value, onChange, min = 0, max = 99, size = 'md' }: QuantitySelectorProps) {
  const sizeClasses = size === 'lg'
    ? 'h-12'
    : size === 'sm'
    ? 'h-9 sm:h-10'
    : 'h-10'

  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
  const textWidth = size === 'lg' ? 'w-10' : 'w-7 sm:w-8'

  return (
    <div className={`flex items-center border border-border/60 rounded-full bg-muted/30 ${sizeClasses}`}>
      <button
        className={`${sizeClasses} w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-full active:scale-90`}
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        aria-label="Reducir cantidad"
        disabled={value <= min}
      >
        <Minus className={iconSize} />
      </button>
      <span className={`${textWidth} text-center text-sm font-semibold tabular-nums text-foreground`}>{value}</span>
      <button
        className={`${sizeClasses} w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-full active:scale-90`}
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        aria-label="Aumentar cantidad"
        disabled={value >= max}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  )
}
