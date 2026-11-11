'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

export type LangCode = 'en' | 'hi'

interface LanguageContextValue {
  lang: LangCode
  setLang: (lang: LangCode) => void
  toggleLang: () => void
  t: (en: string, hi: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (en: string) => en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>('en')

  function toggleLang() {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'))
  }

  function t(en: string, hi: string) {
    return lang === 'hi' ? hi : en
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
