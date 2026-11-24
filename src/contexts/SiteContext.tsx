import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { isConfigured, supabase } from '../lib/supabase';
import { DEFAULT_PROFILE } from '../data/defaults';
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  type Lang,
  type Mode,
  type Profile,
  type Settings,
} from '../types';

type SiteContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  mode: Mode;
  toggleMode: () => void;
  settings: Settings;
  previewSettings: (patch: Partial<Settings>) => void;
  profile: Profile | null;
  reloadSite: () => Promise<void>;
};

const SiteContext = createContext<SiteContextValue | null>(null);

function initialMode(): Mode {
  try {
    const stored = localStorage.getItem('mode');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'ne' ? 'ne' : 'en';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile | null>(isConfigured ? null : DEFAULT_PROFILE);

  const reloadSite = useCallback(async () => {
    if (!isConfigured) return;
    const [s, p] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
    ]);
    if (s.data) setSettings(normalizeSettings(s.data as Settings));
    setProfile(p.data ? (p.data as Profile) : DEFAULT_PROFILE);
  }, []);

  useEffect(() => {
    void reloadSite();
  }, [reloadSite]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.dataset.theme = settings.theme;
    root.dataset.font = settings.font;
    root.lang = lang;
  }, [mode, settings.theme, settings.font, lang]);

  const setLang = useCallback(
    (l: Lang) => {
      void i18n.changeLanguage(l);
      try {
        localStorage.setItem('lang', l);
      } catch {
        /* storage unavailable */
      }
    },
    [i18n],
  );

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next: Mode = m === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('mode', next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const previewSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, mode, toggleMode, settings, previewSettings, profile, reloadSite }),
    [lang, setLang, mode, toggleMode, settings, previewSettings, profile, reloadSite],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
