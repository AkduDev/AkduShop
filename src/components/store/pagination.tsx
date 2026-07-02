'use client'

import { useMemo } from 'react'
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

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageNumbers = useMemo(() => {
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
  }, [currentPage, totalPages])

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 md:mt-12">
      {/* Primera página */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 md:h-11 md:w-11 rounded-full border-primary/30 hover:bg-primary/10 disabled:opacity-50"
        disabled={!hasPrevPage}
        onClick={() => handlePageChange(1)}
        aria-label="Primera página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Página anterior */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 md:h-11 md:w-11 rounded-full border-primary/30 hover:bg-primary/10 disabled:opacity-50"
        disabled={!hasPrevPage}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      <div className="flex items-center gap-1 md:gap-1.5">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              className={`h-10 w-10 md:h-11 md:w-11 rounded-full ${
                currentPage === page
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'border-primary/30 hover:bg-primary/10'
              }`}
              onClick={() => handlePageChange(page as number)}
              aria-current={currentPage === page ? 'page' : undefined}
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
        className="h-10 w-10 md:h-11 md:w-11 rounded-full border-primary/30 hover:bg-primary/10 disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Última página */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 md:h-11 md:w-11 rounded-full border-primary/30 hover:bg-primary/10 disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => handlePageChange(totalPages)}
        aria-label="Última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {/* Info de páginas */}
      <span className="hidden md:ml-4 md:text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  )
}
