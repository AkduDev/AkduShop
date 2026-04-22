'use client'

import { useState } from 'react'
import { Lock, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminLoginProps {
  isAdmin: boolean
  onLogin: (email: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
}

export function AdminLogin({ isAdmin, onLogin, onLogout }: AdminLoginProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const success = await onLogin(email, password)
    
    if (success) {
      setOpen(false)
      setEmail('')
      setPassword('')
    } else {
      setError('Credenciales incorrectas')
    }
    
    setLoading(false)
  }
  
  if (isAdmin) {
    return (
      <Button 
        variant="outline" 
        onClick={onLogout}
        className="rounded-full border-border/50 hover:border-destructive hover:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    )
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Acceso Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@lesly.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
              {error}
            </p>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
            disabled={loading}
          >
            <Lock className="mr-2 h-4 w-4" />
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
