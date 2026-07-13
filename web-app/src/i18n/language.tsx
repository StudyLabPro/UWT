import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'ru' | 'en'

/** A value that carries both a Russian and an English variant. */
export type Localized<T = string> = { ru: T; en: T }

/** Pick the active-language variant out of a Localized value. */
export function pick<T>(lang: Lang, value: Localized<T>): T {
  return value[lang]
}

/** Shorthand for building a Localized pair inline (strings, arrays, nodes…). */
export function loc<T = string>(ru: T, en: T): Localized<T> {
  return { ru, en }
}

const STORAGE_KEY = 'uwt-lang'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Convenience translator bound to the active language. */
  t: <T>(value: Localized<T>) => T
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'ru' || stored === 'en') {
      return stored
    }
  } catch {
    // localStorage can throw in restrictive/private-browsing contexts — fall back silently.
  }

  return 'ru'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang())

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Ignore persistence failures (private mode, disabled storage, etc.)
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(() => setLangState((prev) => (prev === 'ru' ? 'en' : 'ru')), [])
  const t = useCallback(<T,>(value: Localized<T>) => pick(lang, value), [lang])

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLang() must be used within a LanguageProvider')
  }
  return ctx
}
