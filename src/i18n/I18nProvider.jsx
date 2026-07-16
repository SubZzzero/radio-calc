import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { languages, translate } from './translations';

const I18nContext = createContext({ language: 'ru', setLanguage: () => {}, t: (value) => value });

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'ru';
    const savedLanguage = window.localStorage.getItem('radiocalc-language');
    return languages.some((item) => item.id === savedLanguage) ? savedLanguage : 'ru';
  });
  const i18n = useMemo(() => ({
    language,
    setLanguage,
    t: (value) => translate(value, language),
  }), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('radiocalc-language', language);
  }, [language]);

  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
