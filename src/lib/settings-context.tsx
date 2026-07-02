'use client'

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types'

interface SettingsContextValue {
  settings: SiteSettings
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      if (!res.ok) return DEFAULT_SETTINGS
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  })

  const value = useMemo(
    () => ({ settings: settings || DEFAULT_SETTINGS, loading: isLoading }),
    [settings, isLoading]
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
