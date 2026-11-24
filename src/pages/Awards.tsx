import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { useSite } from '../contexts/SiteContext';
import { formatYear, loc } from '../lib/localized';
import type { Award } from '../types';
import PageHeader from '../components/PageHeader';
import Status from '../components/Status';

export default function Awards() {
  const { t } = useTranslation();
  const { lang } = useSite();
  const { rows, loading, error } = useTable<Award>('awards', 'year', false);

  return (
    <>
      <PageHeader title={t('awards.title')} />
      <Status loading={loading} error={error} empty={rows.length === 0} />
      <div className="grid">
        {rows.map((a) => (
          <article className="card" key={a.id}>
            {a.year !== null && <span className="badge">{formatYear(a.year, lang)}</span>}
            <h3>{loc(a, 'title', lang)}</h3>
            <p>{loc(a, 'description', lang)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
