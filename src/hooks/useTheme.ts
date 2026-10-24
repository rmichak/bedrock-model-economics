import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'bme-theme'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function stored(): Theme | null {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/** Follows the OS until the viewer picks a theme; the pick is a per-browser convenience. */
export function useTheme() {
  const [override, setOverride] = useState<Theme | null>(stored)
  const [system, setSystem] = useState<Theme>(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const on = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (override) root.dataset.theme = override
    else delete root.dataset.theme
  }, [override])

  const theme = override ?? system
  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setOverride(next)
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
  }, [theme])

  return { theme, toggle }
}
