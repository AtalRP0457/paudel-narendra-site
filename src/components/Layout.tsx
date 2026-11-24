import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSite } from '../contexts/SiteContext';
import { isConfigured } from '../lib/supabase';
import { loc } from '../lib/localized';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { HOME } from '../data/defaults';

export default function Layout() {
  const { t } = useTranslation();
  const { profile, lang } = useSite();
  const name = profile ? loc(profile, 'name', lang) : '';

  useEffect(() => {
    if (name) document.title = name;
  }, [name]);

  return (
    <>
      <a className="skip" href="#main">{t('nav.skip')}</a>
      {!isConfigured && import.meta.env.DEV && <div className="banner" role="alert">{t('config.missing')}</div>}
      <Navbar />
      <main id="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} {name} · {t('footer.rights')}</span>
          <ul className="footer-links">
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
            {HOME.socials.map((s) => (
              <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}
