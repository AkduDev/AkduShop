'use client'

import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/store/cart-drawer'
import { AdminLogin } from '@/components/store/admin-login'
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
  const mobileMenuOpen = false // Simplificado - se maneja en page.tsx
  
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo-profesional.jpg" 
              alt="Carteras Lesly" 
              width={180}
              height={60}
              className="h-12 w-auto object-contain logo-transparent"
              priority
            />
          </div>
          
          {/* Desktop Navigation */}
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
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <CartDrawer onCheckout={onCheckout} />
            <AdminLogin isAdmin={isAdmin} onLogin={onLogin} onLogout={onLogout} />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
