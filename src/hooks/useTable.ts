import { useCallback, useEffect, useState } from 'react';
import { isConfigured, supabase } from '../lib/supabase';
import { DEFAULT_ROWS } from '../data/defaults';

function sortRows<T>(rows: T[], orderBy: string, ascending: boolean): T[] {
  const key = (r: T) => (r as Record<string, unknown>)[orderBy];
  return [...rows].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    const cmp = x < y ? -1 : 1;
    return ascending ? cmp : -cmp;
  });
}

export function useTable<T>(table: string, orderBy: string, ascending = true) {
  const fallback = (DEFAULT_ROWS[table] ?? []) as T[];
  const [rows, setRows] = useState<T[]>(isConfigured ? [] : sortRows(fallback, orderBy, ascending));
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isConfigured) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending });
    if (err) {
      setError(err.message);
    } else {
      setRows((data ?? []) as T[]);
      setError(null);
    }
    setLoading(false);
  }, [table, orderBy, ascending]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, loading, error, reload };
}
