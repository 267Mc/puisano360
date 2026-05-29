'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from './translations'

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextType>({ lang: 'en', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('puisano_lang') as Lang | null
    if (saved === 'en' || saved === 'tn') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('puisano_lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}