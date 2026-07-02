'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

async function fetchReviews(productId: string): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const res = await fetch(`/api/products/${productId}/reviews`)
  if (!res.ok) return { reviews: [], stats: { average: 0, count: 0 } }
  return res.json()
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { customer } = useCustomerAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
    staleTime: 60_000,
  })

  const reviews = data?.reviews ?? []
  const stats = data?.stats ?? { average: 0, count: 0 }

  const submitMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string | null }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al publicar')
      }
      return res.json()
    },
    onSuccess: (newReview) => {
      queryClient.setQueryData(['reviews', productId], (old: { reviews: Review[]; stats: ReviewStats } | undefined) => {
        if (!old) return old
        return {
          reviews: [newReview, ...old.reviews],
          stats: {
            average: (old.stats.average * old.stats.count + newReview.rating) / (old.stats.count + 1),
            count: old.stats.count + 1,
          },
        }
      })
      setRating(0)
      setComment('')
      toast({ title: '¡Reseña publicada!' })
    },
    onError: (e: Error) => {
      toast({ title: e.message || 'Error al publicar', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({ title: 'Selecciona un rating', variant: 'destructive' })
      return
    }
    submitMutation.mutate({ rating, comment: comment.trim() || null })
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
            const pct = stats.count > 0 ? (count / Math.max(stats.count, reviews.length)) * 100 : 0
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
          <Button type="submit" disabled={submitMutation.isPending || rating === 0} size="sm" className="rounded-full">
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Publicar
          </Button>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4 border border-border/50 rounded-2xl">
          <p>Inicia sesión para dejar una reseña</p>
          <p className="text-xs mt-1 text-muted-foreground/70">Haz clic en &ldquo;Mi Cuenta&rdquo; en la barra superior</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
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
