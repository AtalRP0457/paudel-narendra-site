import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { useSite } from '../contexts/SiteContext';
import { loc } from '../lib/localized';
import type { Course } from '../types';
import PageHeader from '../components/PageHeader';
import Status from '../components/Status';

export default function Teaching() {
  const { t } = useTranslation();
  const { lang } = useSite();
  const { rows, loading, error } = useTable<Course>('courses', 'code');

  const groups = useMemo(() => {
    const m = new Map<string, Course[]>();
    rows.forEach((c) => {
      const k = c.term || t('teaching.other');
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(c);
    });
    return Array.from(m.entries());
  }, [rows, t]);

  return (
    <>
      <PageHeader title={t('teaching.title')} intro={t('teaching.intro')} />
      <Status loading={loading} error={error} empty={rows.length === 0} />
      {groups.map(([program, courses]) => (
        <section className="section" key={program}>
          <h2 className="section-title">{program}</h2>
          <div className="grid">
            {courses.map((c) => {
              const desc = loc(c, 'description', lang);
              return (
                <article className="card course" key={c.id}>
                  {c.code && c.code !== program && <p className="meta">{c.code}</p>}
                  <h3>{loc(c, 'title', lang)}</h3>
                  {desc && <p>{desc}</p>}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
