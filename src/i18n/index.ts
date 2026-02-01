import { createContext, useContext } from 'react';
import { id, type Translations } from './id';
import { en } from './en';

export type Language = 'id' | 'en';

export const translations: Record<Language, Translations> = {
  id,
  en,
};

export const defaultLanguage: Language = 'id';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  const stored = localStorage.getItem('language');
  if (stored === 'id' || stored === 'en') return stored;
  return defaultLanguage;
}

export function setStoredLanguage(lang: Language) {
  localStorage.setItem('language', lang);
}
