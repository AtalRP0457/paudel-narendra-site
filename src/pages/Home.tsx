import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSite } from '../contexts/SiteContext';
import { loc } from '../lib/localized';
import { HOME } from '../data/defaults';
import { useTable } from '../hooks/useTable';
import type { ResearchArea } from '../types';

function initials(name: string): string {
  return name
    .replace(/^(dr|prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join('');
}

export default function Home() {
  const { t } = useTranslation();
  const { profile, lang, settings } = useSite();
  const { rows: areas } = useTable<ResearchArea>('research_areas', 'created_at');
  const [photoFailed, setPhotoFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  if (!profile) return <p className="status" role="status">{t('ui.loading')}</p>;

  const name = loc(profile, 'name', lang);
  const role = loc(profile, 'role', lang);
  const bio = loc(profile, 'bio', lang);
  const [title, ...orgParts] = role.split(/,\s*/);
  const org = orgParts.join(', ');
  const ne = lang === 'ne';
  const pubsVisible = !settings.hidden_sections.includes('publications');
  const researchVisible = !settings.hidden_sections.includes('research');

  return (
    <>
      <section className="hero-x">
        <div className="hero-text">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="hero-name">{name}</h1>
          <p className="hero-title">{title}</p>
          {org && <p className="hero-org">{org}</p>}
          <div className="hero-actions">
            {pubsVisible && <Link className="btn" to="/publications">{t('home.seePublications')}</Link>}
            <Link className="btn btn-secondary" to="/contact">{t('home.contactMe')}</Link>
          </div>
          <ul className="social-row" aria-label={t('home.elsewhere')}>
            {HOME.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-photo">
          {profile.photo_url && !photoFailed ? (
            <img src={profile.photo_url} alt={name} onError={() => setPhotoFailed(true)} />
          ) : (
            <div className="hero-initials" aria-hidden="true">{initials(name)}</div>
          )}
        </div>
      </section>

      <section className="stats" aria-label={t('home.atAGlance')}>
        {HOME.stats.map((s) => (
          <div className="stat" key={s.label_en}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{ne ? s.label_ne : s.label_en}</span>
          </div>
        ))}
      </section>

      {bio && (
        <section className="section">
          <h2 className="section-title">{t('home.about')}</h2>
          <div className="prose">
            {bio.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </section>
      )}

      {researchVisible && areas.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">{t('home.researchFocus')}</h2>
            <Link to="/research">{t('home.more')} →</Link>
          </div>
          <ul className="chips">
            {areas.map((a) => <li key={a.id}>{loc(a, 'title', lang)}</li>)}
          </ul>
        </section>
      )}

      <div className="two-col">
        <section className="section">
          <h2 className="section-title">{t('home.roles')}</h2>
          <ol className="timeline">
            {HOME.roles.map((r) => (
              <li key={r.title_en + r.when}>
                {r.when && <span className="tl-when">{ne ? r.when_ne : r.when}</span>}
                <strong>{ne ? r.title_ne : r.title_en}</strong>
                <span className="tl-org">{ne ? r.org_ne : r.org_en}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="section">
          <h2 className="section-title">{t('home.education')}</h2>
          <ol className="timeline">
            {HOME.education.map((e) => (
              <li key={e.title_en}>
                <span className="tl-when">{e.year}</span>
                <strong>{ne ? e.title_ne : e.title_en}</strong>
                <span className="tl-org">{ne ? e.org_ne : e.org_en}</span>
              </li>
            ))}
          </ol>

          <h2 className="section-title" style={{ marginTop: 32 }}>{t('home.memberships')}</h2>
          <ul className="members">
            {HOME.memberships.map((m) => (
              <li key={m.short}>
                <abbr title={m.name}>{m.short}</abbr>
                <span>{m.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="section">
        <h2 className="section-title">{t('home.activities')}</h2>
        <ul className="gallery">
          {HOME.gallery.map((g, i) => (
            <li key={g.src}>
              <button type="button" onClick={() => setOpen(i)} aria-label={ne ? g.caption_ne : g.caption_en}>
                <img src={g.src} alt="" loading="lazy" />
              </button>
              <span>{ne ? g.caption_ne : g.caption_en}</span>
            </li>
          ))}
        </ul>
      </section>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={HOME.gallery[open].src} alt={ne ? HOME.gallery[open].caption_ne : HOME.gallery[open].caption_en} />
            <figcaption>{ne ? HOME.gallery[open].caption_ne : HOME.gallery[open].caption_en}</figcaption>
            <button type="button" className="icon-btn" onClick={() => setOpen(null)} autoFocus>
              {t('home.close')}
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
