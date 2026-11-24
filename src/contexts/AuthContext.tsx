import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthValue = {
  loading: boolean;
  session: Session | null;
  isEditor: boolean | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isEditor, setIsEditor] = useState<boolean | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setIsEditor(null);
      return;
    }
    let cancelled = false;
    void supabase.rpc('is_editor').then(({ data, error }) => {
      if (!cancelled) setIsEditor(error ? false : Boolean(data));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/scholar-desk` },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsEditor(null);
  }, []);

  const loading = !sessionReady || (session !== null && isEditor === null);

  const value = useMemo(
    () => ({ loading, session, isEditor, signIn, signOut }),
    [loading, session, isEditor, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
