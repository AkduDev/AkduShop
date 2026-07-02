'use client'

import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { AnnouncementBar } from './announcement-bar'
import { BackToTop } from './back-to-top'
import { useCategories } from '@/hooks/use-categories'
import { useAuth } from '@/hooks/use-auth'
import { useCartCheckout } from '@/hooks/use-cart-checkout'

interface StoreLayoutProps {
  children: ReactNode
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { categories } = useCategories()
  const { isAdmin, login, logout } = useAuth()
  const { handleWhatsAppCheckout } = useCartCheckout()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header
        selectedCategory="all"
        categories={categories ?? []}
        onCategoryChange={() => {}}
        onCheckout={handleWhatsAppCheckout}
        isAdmin={isAdmin}
        onLogin={login}
        onLogout={logout}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
