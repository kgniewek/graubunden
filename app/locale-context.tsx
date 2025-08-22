'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'de' | 'it' | 'fr';

interface LocaleContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LocaleContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Translation component for inline translations
export const T = ({ en, de, it, fr }: { en: string; de: string; it: string; fr: string }) => {
  const { language } = useLocale();
  return (
    <>
      {{
        en,
        de,
        it,
        fr
      }[language] || en}
    </>
  );
};