'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)
    
    // Aquí puedes enviar el error a un servicio de logging
    // ej: Sentry, LogRocket, etc.
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground">
              Algo salió mal
            </h2>
            
            <p className="text-muted-foreground">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left p-4 bg-muted rounded-lg text-sm">
                <p className="font-mono text-red-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar página
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
              >
                Volver atrás
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
