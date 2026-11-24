import { useTranslation } from 'react-i18next';
import { useSite } from '../contexts/SiteContext';

export function ModeToggle() {
  const { t } = useTranslation();
  const { mode, toggleMode } = useSite();
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleMode}
      aria-label={mode === 'dark' ? t('ui.lightMode') : t('ui.darkMode')}
    >
      <span aria-hidden="true">{mode === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}

export function LangToggle() {
  const { t } = useTranslation();
  const { lang, setLang } = useSite();
  const target = lang === 'en' ? 'ne' : 'en';
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => setLang(target)}
      aria-label={t('ui.language')}
      lang={target}
    >
      {target === 'ne' ? 'नेपाली' : 'English'}
    </button>
  );
}
