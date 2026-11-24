export type Lang = 'en' | 'ne';
export type Mode = 'light' | 'dark';

export const SECTION_KEYS = ['research', 'publications', 'awards', 'teaching'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type Settings = {
  id: number;
  theme: string;
  font: string;
  section_order: SectionKey[];
  hidden_sections: SectionKey[];
};

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  theme: 'teal',
  font: 'traditional',
  section_order: [...SECTION_KEYS],
  hidden_sections: ['awards'],
};

export function normalizeSettings(s: Settings): Settings {
  const order = Array.isArray(s.section_order) ? s.section_order : [];
  const hidden = Array.isArray(s.hidden_sections) ? s.hidden_sections : [];
  return {
    ...s,
    section_order: [
      ...order.filter((k) => SECTION_KEYS.includes(k)),
      ...SECTION_KEYS.filter((k) => !order.includes(k)),
    ],
    hidden_sections: hidden.filter((k) => SECTION_KEYS.includes(k)),
  };
}

export type Profile = {
  id: number;
  name_en: string;
  name_ne: string;
  role_en: string;
  role_ne: string;
  bio_en: string;
  bio_ne: string;
  office_en: string;
  office_ne: string;
  office_hours_en: string;
  office_hours_ne: string;
  email: string;
  phone: string;
  photo_url: string;
};

export type ResearchArea = {
  id: number;
  title_en: string;
  title_ne: string;
  description_en: string;
  description_ne: string;
};

export const PUB_KINDS = ['book', 'edited', 'chapter', 'article', 'conference'] as const;
export type PubKind = (typeof PUB_KINDS)[number];

export type Publication = {
  id: number;
  kind: string;
  title_en: string;
  title_ne: string;
  authors: string;
  venue: string;
  year: number | null;
  url: string;
  pdf_url: string;
};

export type Award = {
  id: number;
  title_en: string;
  title_ne: string;
  description_en: string;
  description_ne: string;
  year: number | null;
};

export type Course = {
  id: number;
  code: string;
  title_en: string;
  title_ne: string;
  term: string;
  description_en: string;
  description_ne: string;
};
