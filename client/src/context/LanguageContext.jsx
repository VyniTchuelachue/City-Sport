import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import fr from '../i18n/fr.js';
import en from '../i18n/en.js';

const dictionaries = { fr, en };
const STORAGE_KEY = 'citysport.lang';

const LanguageContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in dictionaries) return saved;
  } catch {
    // Storage can be blocked (private mode); fall through to the browser language.
  }
  // French is the default; English-language browsers get English.
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not being able to remember the choice is not worth interrupting anyone for.
    }
  }, [lang]);

  // t('shop.count', 3) → looks up the key and calls it when the entry is a function.
  const t = useCallback(
    (key, ...args) => {
      const entry = key.split('.').reduce((node, part) => node?.[part], dictionaries[lang]);
      if (entry === undefined) return key;
      return typeof entry === 'function' ? entry(...args) : entry;
    },
    [lang]
  );

  // pick({ fr, en }) → the string for the current language.
  const pick = useCallback((value) => value?.[lang] ?? value?.fr ?? '', [lang]);

  const value = useMemo(
    () => ({ lang, t, pick, toggle: () => setLang((l) => (l === 'fr' ? 'en' : 'fr')) }),
    [lang, t, pick]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

export function usePageTitle(title) {
  const { t } = useLang();
  useEffect(() => {
    const site = t('siteName');
    document.title = title ? `${title} | ${site}` : site;
  }, [title, t]);
}
