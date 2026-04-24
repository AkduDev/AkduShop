'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AdminSectionProps {
  title: string
  description: string
  icon: ReactNode
  action: ReactNode
  loading: boolean
  desktopView: ReactNode
  mobileView: ReactNode
  desktopSkeleton: ReactNode
  mobileSkeleton: ReactNode
}

export function AdminSection({
  title,
  description,
  icon,
  action,
  loading,
  desktopView,
  mobileView,
  desktopSkeleton,
  mobileSkeleton
}: AdminSectionProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <div className="hidden md:block">{desktopSkeleton}</div>
            <div className="md:hidden">{mobileSkeleton}</div>
          </>
        ) : (
          <>
            <div className="hidden md:block">{desktopView}</div>
            <div className="md:hidden">{mobileView}</div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
