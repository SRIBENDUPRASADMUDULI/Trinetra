'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  isDark: boolean
  setTheme: (next: ThemeMode) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'trinetra-theme'

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
})

function applyThemeToDom(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute('content', mode === 'dark' ? '#090D0A' : '#1E2420')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      let resolved: ThemeMode = 'light'
      if (saved === 'dark' || saved === 'light') {
        resolved = saved
      } else if (document.documentElement.classList.contains('dark')) {
        resolved = 'dark'
      } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        resolved = 'dark'
      }
      setThemeState(resolved)
      applyThemeToDom(resolved)
    } catch {
      applyThemeToDom('light')
    }
  }, [])

  const setTheme = (next: ThemeMode) => {
    setThemeState(next)
    applyThemeToDom(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors in restricted contexts
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
