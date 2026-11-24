import type { Lang } from '../types';

export function loc(row: Record<string, unknown>, field: string, lang: Lang): string {
  const primary = row[`${field}_${lang}`];
  if (typeof primary === 'string' && primary.trim() !== '') return primary;
  const fallback = row[`${field}_en`];
  return typeof fallback === 'string' ? fallback : '';
}

export function formatYear(year: number | null, lang: Lang): string {
  if (year === null || year === undefined) return '';
  return new Intl.NumberFormat(lang === 'ne' ? 'ne-NP' : 'en-US', {
    useGrouping: false,
  }).format(year);
}
