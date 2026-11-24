import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { FONTS, THEMES } from '../lib/themes';
import type { SectionKey } from '../types';

export default function AppearanceEditor() {
  const { t } = useTranslation();
  const { settings, previewSettings, reloadSite } = useSite();
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  function move(index: number, delta: number) {
    const order = [...settings.section_order];
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    previewSettings({ section_order: order });
  }

  function toggle(key: SectionKey, visible: boolean) {
    const hidden = visible
      ? settings.hidden_sections.filter((k) => k !== key)
      : [...settings.hidden_sections, key];
    previewSettings({ hidden_sections: hidden });
  }

  async function save() {
    setStatus('idle');
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      theme: settings.theme,
      font: settings.font,
      section_order: settings.section_order,
      hidden_sections: settings.hidden_sections,
    });
    if (error) {
      setStatus('error');
      return;
    }
    await reloadSite();
    setStatus('saved');
  }

  return (
    <div className="card">
      <p className="hint" style={{ marginTop: 0 }}>{t('admin.appearance.hint')}</p>

      <h3>{t('admin.appearance.theme')}</h3>
      <div className="swatches">
        {THEMES.map((th) => (
          <button
            key={th.id}
            type="button"
            className="swatch"
            style={{ background: th.swatch }}
            aria-label={t(`themes.${th.id}`)}
            title={t(`themes.${th.id}`)}
            aria-pressed={settings.theme === th.id}
            onClick={() => previewSettings({ theme: th.id })}
          />
        ))}
      </div>

      <h3>{t('admin.appearance.font')}</h3>
      <div className="font-btns">
        {FONTS.map((f) => (
          <button
            key={f}
            type="button"
            className="font-btn"
            aria-pressed={settings.font === f}
            onClick={() => previewSettings({ font: f })}
          >
            {t(`fonts.${f}`)}
          </button>
        ))}
      </div>

      <h3>{t('admin.appearance.sections')}</h3>
      <div style={{ marginBottom: 20 }}>
        {settings.section_order.map((key, i) => (
          <div className="row" key={key}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0, fontWeight: 400 }}>
              <input
                type="checkbox"
                checked={!settings.hidden_sections.includes(key)}
                onChange={(e) => toggle(key, e.target.checked)}
              />
              {t(`nav.${key}`)}
              <span className="hint">({t('admin.appearance.visible')})</span>
            </label>
            <div className="row-actions">
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t('admin.appearance.moveUp')}: ${t(`nav.${key}`)}`}>
                <span aria-hidden="true">↑</span>
              </button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === settings.section_order.length - 1} aria-label={`${t('admin.appearance.moveDown')}: ${t(`nav.${key}`)}`}>
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn" onClick={() => void save()}>{t('admin.appearance.save')}</button>
      {status === 'saved' && <p className="ok" role="status">{t('admin.saved')}</p>}
      {status === 'error' && <p className="error" role="alert">{t('admin.failed')}</p>}
    </div>
  );
}
