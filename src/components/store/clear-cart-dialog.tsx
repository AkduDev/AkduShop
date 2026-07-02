'use client'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClearCartDialogProps {
  itemCount: number
  onClear: () => void
}

export function ClearCartDialog({ itemCount, onClear }: ClearCartDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
          aria-label="Vaciar carrito"
        >
          <Trash className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán todos los {itemCount} producto{itemCount !== 1 ? 's' : ''} del carrito. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onClear} className="bg-destructive hover:bg-destructive/90">
            Vaciar carrito
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
