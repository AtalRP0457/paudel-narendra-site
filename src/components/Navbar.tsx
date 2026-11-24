import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSite } from '../contexts/SiteContext';
import { loc } from '../lib/localized';
import { LangToggle, ModeToggle } from './Toggles';

export default function Navbar() {
  const { t } = useTranslation();
  const { settings, profile, lang } = useSite();
  const [open, setOpen] = useState(false);
  const visible = settings.section_order.filter((k) => !settings.hidden_sections.includes(k));
  const name = profile ? loc(profile, 'name', lang) : '';
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          {name || ' '}
        </Link>
        <div className="tools">
          <LangToggle />
          <ModeToggle />
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen(!open)}
          >
            {t('nav.menu')}
          </button>
        </div>
        <nav id="nav-links" className={open ? 'links open' : 'links'} aria-label="Main">
          <NavLink to="/" end onClick={close}>{t('nav.home')}</NavLink>
          {visible.map((k) => (
            <NavLink key={k} to={`/${k}`} onClick={close}>{t(`nav.${k}`)}</NavLink>
          ))}
          <NavLink to="/contact" onClick={close}>{t('nav.contact')}</NavLink>
        </nav>
      </div>
    </header>
  );
}
