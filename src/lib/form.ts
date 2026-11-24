export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'email' | 'image' | 'pdf' | 'select';

export type FieldDef = {
  key: string;
  type: FieldType;
  bilingual?: boolean;
  required?: boolean;
  label?: string;
  folder?: string;
  options?: readonly string[];
  optionLabel?: string;
};

export type Values = Record<string, string>;

export function columnsOf(f: FieldDef): string[] {
  return f.bilingual ? [`${f.key}_en`, `${f.key}_ne`] : [f.key];
}

export function toValues(row: Record<string, unknown> | null, fields: FieldDef[]): Values {
  const out: Values = {};
  for (const f of fields) {
    for (const c of columnsOf(f)) {
      const v = row ? row[c] : '';
      out[c] = v === null || v === undefined ? '' : String(v);
    }
  }
  return out;
}

export function fromValues(
  values: Values,
  fields: FieldDef[],
): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const f of fields) {
    for (const c of columnsOf(f)) {
      const raw = (values[c] ?? '').trim();
      if (f.type === 'number') {
        out[c] = raw === '' ? null : Number(raw);
      } else if (f.type === 'select' && raw === '') {
        out[c] = f.options?.[0] ?? '';
      } else {
        out[c] = raw;
      }
    }
  }
  return out;
}
