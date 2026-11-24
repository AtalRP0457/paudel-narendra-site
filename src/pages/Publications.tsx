import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { useSite } from '../contexts/SiteContext';
import { formatYear, loc } from '../lib/localized';
import { PUB_KINDS, type Publication } from '../types';
import PageHeader from '../components/PageHeader';
import Status from '../components/Status';

export default function Publications() {
  const { t } = useTranslation();
  const { lang } = useSite();
  const { rows, loading, error } = useTable<Publication>('publications', 'year', false);
  const [kind, setKind] = useState<string>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.kind || 'article';
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== 'all' && (r.kind || 'article') !== kind) return false;
      if (!q) return true;
      return [r.title_en, r.title_ne, r.authors, r.venue, String(r.year ?? '')]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [rows, kind, query]);

  const byYear = useMemo(() => {
    const groups = new Map<string, Publication[]>();
    shown.forEach((p) => {
      const y = p.year === null ? '—' : String(p.year);
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(p);
    });
    return Array.from(groups.entries());
  }, [shown]);

  const kinds = PUB_KINDS.filter((k) => counts[k]);

  return (
    <>
      <PageHeader title={t('publications.title')} intro={t('publications.intro')} />

      {rows.length > 0 && (
        <div className="pub-tools">
          <div className="filter-chips" role="group" aria-label={t('publications.type')}>
            <button type="button" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>
              {t('publications.all')} <span>{rows.length}</span>
            </button>
            {kinds.map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {t(`publications.kinds.${k}`)} <span>{counts[k]}</span>
              </button>
            ))}
          </div>
          <div className="search">
            <label htmlFor="pub-search" className="sr-only">{t('publications.search')}</label>
            <input
              id="pub-search"
              type="search"
              placeholder={t('publications.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <Status loading={loading} error={error} empty={rows.length === 0} />
      {rows.length > 0 && shown.length === 0 && <p className="status">{t('publications.noMatch')}</p>}

      {byYear.map(([y, items]) => (
        <section className="year-group" key={y}>
          <h2 className="year-label">{y === '—' ? y : formatYear(Number(y), lang)}</h2>
          <ol className="pub-list">
            {items.map((p) => (
              <li key={p.id} className="pub">
                <span className={`kind kind-${p.kind || 'article'}`}>{t(`publications.kinds.${p.kind || 'article'}`)}</span>
                <h3>{loc(p, 'title', lang)}</h3>
                {lang === 'en' && p.title_ne && <p className="meta" lang="ne">{p.title_ne}</p>}
                <p className="meta">{[p.authors, p.venue].filter(Boolean).join(' · ')}</p>
                {(p.url || p.pdf_url) && (
                  <div className="links-row">
                    {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noopener noreferrer">{t('publications.pdf')}</a>}
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">{t('publications.link')}</a>}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
