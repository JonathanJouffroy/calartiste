'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { t as translate } from './i18n'

const LangContext = createContext({ lang: 'fr', setLang: () => {}, t: () => '' })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('fr')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('calar_lang')
    if (saved === 'en' || saved === 'fr') setLangState(saved)
    setReady(true)
  }, [])

  const setLang = (newLang) => {
    setLangState(newLang)
    localStorage.setItem('calar_lang', newLang)
  }

  const t = (path) => translate(lang, path)

  // Évite un flash de contenu mal traduit au premier rendu
  if (!ready) return null

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Helper pour récupérer un champ avec fallback EN -> FR si vide
export function localized(obj, field, lang) {
  if (lang === 'en') {
    const enField = obj[`${field}_en`]
    if (enField && enField.trim()) return enField
  }
  return obj[field] || ''
}
