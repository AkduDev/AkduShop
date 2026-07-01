import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-card flex flex-col h-full">
      <div className="relative">
        <Skeleton className="aspect-square w-full rounded-none" />
        <Skeleton className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 rounded-full" />
      </div>

      <div className="p-3 sm:p-4 space-y-2 flex-1">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4 hidden sm:block" />
        <Skeleton className="h-5 sm:h-6 w-20 mt-1" />
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex flex-col gap-2">
        <Skeleton className="h-9 sm:h-10 w-full rounded-full" />
        <Skeleton className="h-8 sm:h-9 w-full rounded-full" />
      </div>
    </div>
  )
}
