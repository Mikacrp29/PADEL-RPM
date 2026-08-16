import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

const KEY = 'padel:language';
const DEFAULT_LANGUAGE: Language = 'fr';

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'en' ? 'en' : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * App-wide language switch. French is the original/default language — the
 * app never silently switches away from it; the person has to explicitly
 * pick English, and that choice is remembered per browser.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      // Non-fatal: the choice just won't survive a reload this time.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] as string,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
