import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../contexts/SiteContext';
import { loc } from '../lib/localized';
import PageHeader from '../components/PageHeader';
import { HOME } from '../data/defaults';

type Errors = { name?: string; email?: string; message?: string };

export default function Contact() {
  const { t } = useTranslation();
  const { profile, lang } = useSite();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [info, setInfo] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = t('contact.errName');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('contact.errEmail');
    if (!message.trim()) next.message = t('contact.errMessage');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!profile?.email) {
      setInfo(t('contact.noEmail'));
      return;
    }
    const subject = encodeURIComponent(`${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n${name.trim()}\n${email.trim()}`);
    setInfo(t('contact.opening'));
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  const office = profile ? loc(profile, 'office', lang) : '';
  const hours = profile ? loc(profile, 'office_hours', lang) : '';

  return (
    <>
      <PageHeader title={t('contact.title')} />
      <div className="grid">
        <section className="card">
          <dl style={{ margin: 0 }}>
            {office && (<><dt className="meta">{t('contact.office')}</dt><dd style={{ margin: '0 0 12px' }}>{office}</dd></>)}
            {hours && (<><dt className="meta">{t('contact.hours')}</dt><dd style={{ margin: '0 0 12px' }}>{hours}</dd></>)}
            {profile?.email && (
              <><dt className="meta">{t('contact.email')}</dt>
              <dd style={{ margin: '0 0 12px' }}><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></>
            )}
            {profile?.phone && (
              <><dt className="meta">{t('contact.phone')}</dt>
              <dd style={{ margin: '0 0 12px' }}><a href={`tel:${profile.phone}`}>{profile.phone}</a></dd></>
            )}
            <dt className="meta">{t('contact.online')}</dt>
            <dd style={{ margin: 0, display: 'flex', gap: 16 }}>
              {HOME.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              ))}
            </dd>
          </dl>
        </section>
        <form className="card" onSubmit={onSubmit} noValidate>
          <h2>{t('contact.formTitle')}</h2>
          <div className="field">
            <label htmlFor="c-name">{t('contact.name')}</label>
            <input id="c-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'c-name-err' : undefined} />
            {errors.name && <p id="c-name-err" className="error">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="c-email">{t('contact.yourEmail')}</label>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'c-email-err' : undefined} />
            {errors.email && <p id="c-email-err" className="error">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor="c-msg">{t('contact.message')}</label>
            <textarea id="c-msg" value={message} onChange={(e) => setMessage(e.target.value)}
              aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'c-msg-err' : undefined} />
            {errors.message && <p id="c-msg-err" className="error">{errors.message}</p>}
          </div>
          <button type="submit" className="btn">{t('contact.send')}</button>
          {info && <p className="ok" role="status" style={{ marginTop: 12 }}>{info}</p>}
        </form>
      </div>
    </>
  );
}
