'use client'

import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, ChevronDown, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/store/cart-drawer'
import { AdminLogin } from '@/components/store/admin-login'
import { CustomerAuthModal } from '@/components/store/customer-auth-modal'
import { useSettings } from '@/lib/settings-context'
import { useCustomerAuth } from '@/hooks/use-customer-auth'
import { useWishlistStore } from '@/store/wishlist'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Category } from '@/types'

interface WishlistBadgeProps {
  count: number
}

function WishlistBadge({ count }: WishlistBadgeProps) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(t)
  }, [])
  const show = hydrated && count > 0
  return show ? (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  ) : null
}

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
  const { items: wishlistItems } = useWishlistStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId)
    setMobileMenuOpen(false)
  }

  // Desktop: show first 2 categories + "Todos", rest in dropdown
  const mainCategories = categories.slice(0, 2)
  const extraCategories = categories.slice(2)
  const hasMoreCategories = extraCategories.length > 0

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {settings.siteName}
            </span>
          </div>

          {/* Center: Categories - Desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-lg" aria-label="Categorías">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              onClick={() => onCategoryChange('all')}
              className="rounded-full text-sm h-9"
            >
              Todos
            </Button>
            {mainCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                onClick={() => onCategoryChange(category.id)}
                className="rounded-full text-sm h-9"
              >
                {category.name}
              </Button>
            ))}
            {hasMoreCategories && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full text-sm h-9 gap-1 ${
                      extraCategories.some(c => c.id === selectedCategory)
                        ? 'bg-primary text-primary-foreground'
                        : ''
                    }`}
                  >
                    Más
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {extraCategories.map(category => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => onCategoryChange(category.id)}
                      className={selectedCategory === category.id ? 'bg-muted' : ''}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {!isAdmin && (
              <Link href="/wishlist">
                <Button variant="outline" size="icon" className="relative rounded-full border-border/50 hover:border-red-500 hover:text-red-500" aria-label="Favoritos">
                  <Heart className="h-5 w-5" />
                  <WishlistBadge count={wishlistItems.length} />
                </Button>
              </Link>
            )}
            {!isAdmin && <CartDrawer onCheckout={onCheckout} />}
            {!isAdmin && (
              isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Button variant="ghost" size="sm" asChild className="rounded-full text-sm">
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-1" />
                      {customer?.name}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión" className="h-9 w-9">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-sm hidden sm:flex"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <User className="h-4 w-4 mr-1" />
                  Mi Cuenta
                </Button>
              )
            )}
            <AdminLogin isAdmin={isAdmin} onLogin={onLogin} onLogout={onLogout} />

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 space-y-3">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => handleCategoryChange('all')}
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* User actions */}
            <div className="flex gap-2 pt-3 border-t border-border/30">
              {!isAdmin && (
                isLoggedIn ? (
                  <>
                    <Button variant="outline" size="sm" asChild className="flex-1 rounded-full">
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-1" />
                        {customer?.name}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={logout} className="flex-1 rounded-full">
                      <LogOut className="h-4 w-4 mr-1" />
                      Salir
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}
                    className="flex-1 rounded-full"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Mi Cuenta
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  )
}
