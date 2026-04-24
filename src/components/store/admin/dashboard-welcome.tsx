'use client'

import { Package, Folder, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardStats } from '@/types'

interface DashboardWelcomeProps {
  stats: DashboardStats
}

export function DashboardWelcome({ stats }: DashboardWelcomeProps) {
  return (
    <Card className="border-border/50 mt-4">
      <CardHeader>
        <CardTitle>Bienvenido al Panel de Administración</CardTitle>
        <CardDescription>
          Desde aquí puedes gestionar todos los aspectos de tu tienda de carteras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--gold)]" />
              Gestión de Productos
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Crear, editar y eliminar productos</li>
              <li>• Marcar productos como destacados</li>
              <li>• Control de stock</li>
              <li>• Subir imágenes de productos</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Folder className="h-4 w-4 text-[var(--gold)]" />
              Gestión de Categorías
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Crear y editar categorías</li>
              <li>• Organizar productos por categorías</li>
              <li>• Ver cantidad de productos por categoría</li>
            </ul>
          </div>
        </div>
        {stats.lowStockProducts > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              Alerta de Stock Bajo
            </h4>
            <p className="text-sm">
              Tienes {stats.lowStockProducts} producto{stats.lowStockProducts > 1 ? 's' : ''} con stock menor a 5 unidades.
              Ve a la pestaña de Productos para revisar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
