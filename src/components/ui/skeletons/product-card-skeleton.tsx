import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4 hidden sm:block" />
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-full rounded-full" />
      </div>
    </div>
  )
}
