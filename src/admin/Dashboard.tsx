import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import type { FieldDef } from '../lib/form';
import { PUB_KINDS } from '../types';
import ListEditor from './ListEditor';
import ProfileEditor from './ProfileEditor';
import AppearanceEditor from './AppearanceEditor';

const RESEARCH: FieldDef[] = [
  { key: 'title', type: 'text', bilingual: true, required: true },
  { key: 'description', type: 'textarea', bilingual: true },
];

const PUBLICATIONS: FieldDef[] = [
  { key: 'kind', type: 'select', options: PUB_KINDS, optionLabel: 'publications.kinds' },
  { key: 'title', type: 'text', bilingual: true, required: true },
  { key: 'authors', type: 'text' },
  { key: 'venue', type: 'text' },
  { key: 'year', type: 'number' },
  { key: 'url', type: 'url' },
  { key: 'pdf_url', type: 'pdf', label: 'pdf', folder: 'papers' },
];

const AWARDS: FieldDef[] = [
  { key: 'title', type: 'text', bilingual: true, required: true },
  { key: 'description', type: 'textarea', bilingual: true },
  { key: 'year', type: 'number' },
];

const COURSES: FieldDef[] = [
  { key: 'code', type: 'text', required: true },
  { key: 'title', type: 'text', bilingual: true, required: true },
  { key: 'term', type: 'text' },
  { key: 'description', type: 'textarea', bilingual: true },
];

const TABS = ['profile', 'research', 'publications', 'awards', 'courses', 'appearance'] as const;
type Tab = (typeof TABS)[number];

export default function Dashboard() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div>
      <div className="desk-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>{t('admin.portalTitle')}</h1>
          <p className="meta" style={{ margin: 0 }}>
            {t('admin.signedInAs')} {session?.user.email}
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void signOut()}>
          {t('admin.signOut')}
        </button>
      </div>

      <div className="tabs" role="group" aria-label={t('admin.portalTitle')}>
        {TABS.map((k) => (
          <button key={k} type="button" className="tab" aria-current={tab === k} onClick={() => setTab(k)}>
            {t(`admin.tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileEditor />}
      {tab === 'research' && (
        <ListEditor key="research" table="research_areas" fields={RESEARCH} orderBy="created_at" titleKey="title" />
      )}
      {tab === 'publications' && (
        <ListEditor key="publications" table="publications" fields={PUBLICATIONS} orderBy="year" ascending={false} titleKey="title" subKey="year" />
      )}
      {tab === 'awards' && (
        <ListEditor key="awards" table="awards" fields={AWARDS} orderBy="year" ascending={false} titleKey="title" subKey="year" />
      )}
      {tab === 'courses' && (
        <ListEditor key="courses" table="courses" fields={COURSES} orderBy="code" titleKey="title" subKey="code" />
      )}
      {tab === 'appearance' && <AppearanceEditor />}
    </div>
  );
}
