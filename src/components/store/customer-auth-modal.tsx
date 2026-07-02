'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomerAuth } from '@/hooks/use-customer-auth'

interface CustomerAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerAuthModal({ open, onOpenChange }: CustomerAuthModalProps) {
  const { login, register } = useCustomerAuth()
  const [tab, setTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginSubmitting(true)
    const success = await login({ email: loginEmail, password: loginPassword })
    setLoginSubmitting(false)
    if (success) {
      onOpenChange(false)
      resetForm()
    } else {
      setLoginError('Email o contraseña incorrectos')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setRegSubmitting(true)
    const success = await register({
      name: regName,
      email: regEmail,
      phone: regPhone || undefined,
      address: regAddress || undefined,
      password: regPassword,
    })
    setRegSubmitting(false)
    if (success) {
      onOpenChange(false)
      resetForm()
    } else {
      setRegError('Error al registrarse. Intenta con otro email.')
    }
  }

  const resetForm = () => {
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
    setRegName('')
    setRegEmail('')
    setRegPhone('')
    setRegAddress('')
    setRegPassword('')
    setRegError('')
  }

  const onTabChange = (value: string) => {
    setTab(value)
    setLoginError('')
    setRegError('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Mi Cuenta</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" loading={loginSubmitting}>
                {loginSubmitting ? 'Entrando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nombre completo</Label>
                <Input
                  id="reg-name"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Teléfono (opcional)</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+53 55 123 4567"
                  autoComplete="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-address">Dirección (opcional)</Label>
                <Input
                  id="reg-address"
                  placeholder="Calle, ciudad"
                  autoComplete="street-address"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {regError && (
                <p className="text-sm text-destructive">{regError}</p>
              )}
              <Button type="submit" className="w-full" loading={regSubmitting}>
                {regSubmitting ? 'Registrando...' : 'Crear Cuenta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
