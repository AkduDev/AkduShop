'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            ¡Ups! Algo salió mal
          </h2>
          <p className="text-muted-foreground">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-left p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">
              Detalles del error (desarrollo):
            </p>
            <p className="text-xs font-mono text-red-500 dark:text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
