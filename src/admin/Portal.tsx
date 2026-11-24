import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { isConfigured } from '../lib/supabase';
import Dashboard from './Dashboard';

export default function Portal() {
  const { t } = useTranslation();
  const { loading, session, isEditor, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (session && isEditor === false) {
      void signOut().then(() => navigate('/', { replace: true }));
    }
  }, [session, isEditor, signOut, navigate]);

  if (!isConfigured) return <p className="status" role="alert">{t('config.missing')}</p>;
  if (loading) return <p className="status" role="status">{t('admin.checking')}</p>;

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
        <h1>{t('admin.portalTitle')}</h1>
        <button type="button" className="btn" onClick={() => void signIn()}>
          {t('admin.signIn')}
        </button>
      </div>
    );
  }

  if (!isEditor) return <p className="status" role="status">{t('admin.checking')}</p>;

  return <Dashboard />;
}
