import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { useSite } from '../contexts/SiteContext';
import { loc } from '../lib/localized';
import type { ResearchArea } from '../types';
import PageHeader from '../components/PageHeader';
import Status from '../components/Status';

export default function Research() {
  const { t } = useTranslation();
  const { lang } = useSite();
  const { rows, loading, error } = useTable<ResearchArea>('research_areas', 'created_at');

  return (
    <>
      <PageHeader title={t('research.title')} intro={t('research.intro')} />
      <Status loading={loading} error={error} empty={rows.length === 0} />
      <div className="grid">
        {rows.map((r, i) => (
          <article className="card area" key={r.id}>
            <span className="area-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{loc(r, 'title', lang)}</h3>
            <p>{loc(r, 'description', lang)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
