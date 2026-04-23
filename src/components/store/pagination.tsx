'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Primera página */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 disabled:opacity-50"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Página anterior */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 disabled:opacity-50"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              className={`h-10 w-10 rounded-full ${
                currentPage === page
                  ? 'bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary'
                  : 'border-[var(--gold)]/30 hover:bg-[var(--gold)]/10'
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        ))}
      </div>

      {/* Página siguiente */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Última página */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {/* Info de páginas */}
      <span className="ml-4 text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  )
}
