'use client'

import { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { useToast } from '@/hooks/use-toast'

interface Review {
  id: string
  rating: number
  comment: string | null
  customerName: string
  createdAt: string
}

interface ReviewStats {
  average: number
  count: number
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { customer } = useCustomerAuth()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loaded, setLoaded] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch {} finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  if (!loaded) {
    fetchReviews()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({ title: 'Selecciona un rating', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment: comment.trim() || null }),
      })

      if (res.ok) {
        const newReview = await res.json()
        setReviews((prev) => [newReview, ...prev])
        setStats((prev) => ({
          average: (prev.average * prev.count + rating) / (prev.count + 1),
          count: prev.count + 1,
        }))
        setRating(0)
        setComment('')
        toast({ title: '¡Reseña publicada!' })
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Error al publicar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error al conectar con el servidor', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= Math.round(stats.average) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{stats.count} reseñas</p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0
            return (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{s}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {customer ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border/50 rounded-2xl">
          <h4 className="font-medium">Escribir una reseña</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
                aria-label={`${s} estrella${s > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    s <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <Button type="submit" disabled={submitting || rating === 0} size="sm" className="rounded-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Publicar
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4 border border-border/50 rounded-2xl">
          Inicia sesión para dejar una reseña
        </p>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay reseñas aún. ¡Sé el primero en opinar!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-4 border border-border/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.customerName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
