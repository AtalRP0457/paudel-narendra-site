import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { fromValues, toValues, type FieldDef, type Values } from '../lib/form';
import RecordForm from './RecordForm';

const FIELDS: FieldDef[] = [
  { key: 'name', type: 'text', bilingual: true, required: true },
  { key: 'role', type: 'text', bilingual: true },
  { key: 'bio', type: 'textarea', bilingual: true },
  { key: 'office', type: 'text', bilingual: true },
  { key: 'office_hours', type: 'text', bilingual: true },
  { key: 'email', type: 'email' },
  { key: 'phone', type: 'text' },
  { key: 'photo_url', type: 'image', label: 'photo', folder: 'photos' },
];

export default function ProfileEditor() {
  const { t } = useTranslation();
  const { profile, reloadSite } = useSite();
  const [saved, setSaved] = useState(false);

  async function save(values: Values) {
    const payload = { id: 1, ...fromValues(values, FIELDS) };
    const { error } = await supabase.from('profile').upsert(payload);
    if (error) throw new Error(error.message);
    await reloadSite();
    setSaved(true);
  }

  return (
    <div>
      <RecordForm key={profile ? 'loaded' : 'empty'} fields={FIELDS} initial={toValues(profile, FIELDS)} onSave={async (v) => { setSaved(false); await save(v); }} />
      {saved && <p className="ok" role="status">{t('admin.saved')}</p>}
    </div>
  );
}
