import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-muted-foreground/30 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/#productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
