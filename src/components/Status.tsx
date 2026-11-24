import { useTranslation } from 'react-i18next';

type Props = { loading: boolean; error: string | null; empty: boolean };

export default function Status({ loading, error, empty }: Props) {
  const { t } = useTranslation();
  if (loading) return <p className="status" role="status">{t('ui.loading')}</p>;
  if (error) return <p className="status" role="alert">{t('ui.error')}</p>;
  if (empty) return <p className="status">{t('ui.empty')}</p>;
  return null;
}
