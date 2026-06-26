'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          setSettings(await res.json())
        }
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
