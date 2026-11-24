import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { ne } from './ne';

let stored: string | null = null;
try {
  stored = localStorage.getItem('lang');
} catch {
  stored = null;
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ne: { translation: ne } },
  lng: stored === 'ne' ? 'ne' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
