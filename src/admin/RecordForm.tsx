import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { columnsOf, type FieldDef, type Values } from '../lib/form';
import { TOO_LARGE, uploadFile } from '../lib/upload';

type Props = {
  fields: FieldDef[];
  initial: Values;
  onSave: (values: Values) => Promise<void>;
  onCancel?: () => void;
};

function TextControl({
  id, field, value, onChange, lang,
}: {
  id: string;
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  lang?: string;
}) {
  if (field.type === 'select') {
    return (
      <SelectControl id={id} field={field} value={value} onChange={onChange} />
    );
  }
  if (field.type === 'textarea') {
    return <textarea id={id} lang={lang} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  const type = field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text';
  return (
    <input id={id} lang={lang} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

function SelectControl({
  id, field, value, onChange,
}: { id: string; field: FieldDef; value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const opts = field.options ?? [];
  return (
    <select id={id} value={value || opts[0] || ''} onChange={(e) => onChange(e.target.value)}>
      {opts.map((o) => (
        <option key={o} value={o}>{field.optionLabel ? t(`${field.optionLabel}.${o}`) : o}</option>
      ))}
    </select>
  );
}

export default function RecordForm({ fields, initial, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const set = (col: string, v: string) => setValues((s) => ({ ...s, [col]: v }));

  async function onFile(f: FieldDef, file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setUploading(f.key);
    try {
      const url = await uploadFile(file, f.folder ?? 'files');
      set(f.key, url);
    } catch (err) {
      const text = err instanceof Error && err.message === TOO_LARGE ? t('admin.tooLarge') : t('admin.failed');
      setMessage({ kind: 'error', text });
    } finally {
      setUploading(null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      if (!f.required) continue;
      const col = f.bilingual ? `${f.key}_en` : f.key;
      if (!(values[col] ?? '').trim()) nextErrors[col] = t('admin.required');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await onSave(values);
    } catch {
      setMessage({ kind: 'error', text: t('admin.failed') });
    } finally {
      setBusy(false);
    }
  }

  const hasBilingual = fields.some((f) => f.bilingual);

  return (
    <form className="card" onSubmit={submit} noValidate>
      {hasBilingual && <p className="hint" style={{ marginTop: 0 }}>{t('admin.nepaliHint')}</p>}
      {fields.map((f) => {
        const label = t(`fields.${f.label ?? f.key}`);

        if (f.type === 'image' || f.type === 'pdf') {
          const current = values[f.key];
          const inputId = `f-${f.key}`;
          return (
            <div className="field" key={f.key}>
              <label htmlFor={inputId}>{label}</label>
              {current && f.type === 'image' && <img className="thumb" src={current} alt="" />}
              {current && f.type === 'pdf' && (
                <p className="meta"><a href={current} target="_blank" rel="noopener noreferrer">{t('admin.currentFile')}</a></p>
              )}
              <input
                id={inputId}
                type="file"
                accept={f.type === 'image' ? 'image/*' : 'application/pdf'}
                onChange={(e) => void onFile(f, e.target.files?.[0])}
              />
              {uploading === f.key && <p className="hint" role="status">{t('admin.uploading')}</p>}
              {current && (
                <button type="button" className="btn btn-secondary btn-small" style={{ marginTop: 8 }} onClick={() => set(f.key, '')}>
                  {t('admin.remove')}
                </button>
              )}
            </div>
          );
        }

        if (f.bilingual) {
          const [colEn, colNe] = columnsOf(f);
          return (
            <fieldset key={f.key}>
              <legend>{label}</legend>
              <div className="cols">
                <div>
                  <label htmlFor={`f-${colEn}`} className="lang-tag" style={{ marginLeft: 0 }}>{t('admin.english')}</label>
                  <TextControl id={`f-${colEn}`} field={f} value={values[colEn] ?? ''} onChange={(v) => set(colEn, v)} lang="en" />
                  {errors[colEn] && <p className="error" role="alert">{errors[colEn]}</p>}
                </div>
                <div>
                  <label htmlFor={`f-${colNe}`} className="lang-tag" style={{ marginLeft: 0 }}>{t('admin.nepali')}</label>
                  <TextControl id={`f-${colNe}`} field={f} value={values[colNe] ?? ''} onChange={(v) => set(colNe, v)} lang="ne" />
                </div>
              </div>
            </fieldset>
          );
        }

        return (
          <div className="field" key={f.key}>
            <label htmlFor={`f-${f.key}`}>{label}</label>
            <TextControl id={`f-${f.key}`} field={f} value={values[f.key] ?? ''} onChange={(v) => set(f.key, v)} />
            {errors[f.key] && <p className="error" role="alert">{errors[f.key]}</p>}
          </div>
        );
      })}
      <div className="row-actions">
        <button type="submit" className="btn" disabled={busy || uploading !== null}>{t('admin.save')}</button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('admin.cancel')}</button>
        )}
      </div>
      {message && (
        <p className={message.kind === 'ok' ? 'ok' : 'error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}
    </form>
  );
}
