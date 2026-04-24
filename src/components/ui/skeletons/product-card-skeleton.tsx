import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        
        {/* Product name */}
        <Skeleton className="h-5 w-full" />
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price and stock */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
