import { useState, useEffect, ReactNode } from 'react';
import { 
  LanguageContext, 
  Language, 
  translations, 
  getStoredLanguage, 
  setStoredLanguage 
} from './index';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
