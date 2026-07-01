'use client'

import { useCallback } from 'react'

export function useShare() {
  const share = useCallback(async (url: string, title: string, text?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url })
        return true
      } catch {
        return false
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        return true
      } catch {
        return false
      }
    }
  }, [])

  return { share }
}
