import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useTable } from '../hooks/useTable';
import { fromValues, toValues, type FieldDef, type Values } from '../lib/form';
import RecordForm from './RecordForm';

type Row = Record<string, unknown> & { id: number };

type Props = {
  table: string;
  fields: FieldDef[];
  orderBy: string;
  ascending?: boolean;
  titleKey: string;
  subKey?: string;
};

function text(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

export default function ListEditor({ table, fields, orderBy, ascending = true, titleKey, subKey }: Props) {
  const { t } = useTranslation();
  const { rows, loading, error, reload } = useTable<Row>(table, orderBy, ascending);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [message, setMessage] = useState('');

  async function save(values: Values) {
    const payload = fromValues(values, fields);
    const target = editing;
    if (target === null) return;
    const res =
      target === 'new'
        ? await supabase.from(table).insert(payload)
        : await supabase.from(table).update(payload).eq('id', target.id);
    if (res.error) throw new Error(res.error.message);
    await reload();
    setEditing(null);
    setMessage(t('admin.saved'));
  }

  async function remove(row: Row) {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    const res = await supabase.from(table).delete().eq('id', row.id);
    if (res.error) {
      setMessage(t('admin.failed'));
      return;
    }
    await reload();
    setMessage(t('admin.deleted'));
  }

  if (editing !== null) {
    return (
      <RecordForm
        key={editing === 'new' ? 'new' : editing.id}
        fields={fields}
        initial={toValues(editing === 'new' ? null : editing, fields)}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="desk-head">
        <button type="button" className="btn" onClick={() => { setMessage(''); setEditing('new'); }}>
          {t('admin.add')}
        </button>
        {message && <span className="ok" role="status">{message}</span>}
      </div>
      {loading && <p className="status" role="status">{t('ui.loading')}</p>}
      {error && <p className="error" role="alert">{t('ui.error')}</p>}
      {!loading && !error && rows.length === 0 && <p className="status">{t('admin.noItems')}</p>}
      {rows.map((row) => (
        <div className="row" key={row.id}>
          <div>
            <strong>{text(row[`${titleKey}_en`]) || text(row[`${titleKey}_ne`])}</strong>
            {subKey && text(row[subKey]) && <div className="meta">{text(row[subKey])}</div>}
          </div>
          <div className="row-actions">
            <button type="button" className="btn btn-secondary btn-small" onClick={() => { setMessage(''); setEditing(row); }}>
              {t('admin.edit')}
            </button>
            <button type="button" className="btn btn-danger btn-small" onClick={() => void remove(row)}>
              {t('admin.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
