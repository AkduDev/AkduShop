'use client'

import { useState } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/store/cart-drawer'
import { AdminLogin } from '@/components/store/admin-login'
import { CustomerAuthModal } from '@/components/store/customer-auth-modal'
import { useSettings } from '@/lib/settings-context'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { Category } from '@/types'

interface HeaderProps {
  selectedCategory: string
  categories: Category[]
  onCategoryChange: (categoryId: string) => void
  onCheckout: () => void
  isAdmin: boolean
  onLogin: (email: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
}

export function Header({
  selectedCategory,
  categories,
  onCategoryChange,
  onCheckout,
  isAdmin,
  onLogin,
  onLogout
}: HeaderProps) {
  const { settings } = useSettings()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {settings.siteName}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              onClick={() => onCategoryChange('all')}
              className="rounded-full"
            >
              Todos
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                onClick={() => onCategoryChange(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isAdmin && <CartDrawer onCheckout={onCheckout} />}
            {!isAdmin && (
              isLoggedIn ? (
                <div className="hidden md:flex items-center gap-1">
                  <Button variant="ghost" size="sm" asChild className="rounded-full">
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-1" />
                      {customer?.name}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mi Cuenta</span>
                </Button>
              )
            )}
            <AdminLogin isAdmin={isAdmin} onLogin={onLogin} onLogout={onLogout} />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleCategoryChange('all')}
                >
                  Todos
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border/30">
                {!isAdmin && (
                  isLoggedIn ? (
                    <>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href="/profile">
                          <User className="h-4 w-4 mr-1" />
                          {customer?.name}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={logout} className="flex-1">
                        <LogOut className="h-4 w-4 mr-1" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }} className="flex-1">
                      <User className="h-4 w-4 mr-1" />
                      Mi Cuenta
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  )
}
