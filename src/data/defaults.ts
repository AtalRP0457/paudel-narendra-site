// Built-in content for Dr. Narendra Raj Paudel.
// The site shows this when Supabase isn't connected yet, so it works out of the box.
// Once Supabase is connected, the dashboard content takes over.
// The Home page extras (stats, roles, education, memberships, gallery, socials)
// always come from here: edit content.json to change them.
import content from './content.json';
import type { Award, Course, Profile, Publication, ResearchArea } from '../types';

type Raw = Record<string, unknown>;

function withIds<T>(rows: Raw[], base: Raw): T[] {
  return rows.map((r, i) => ({ ...base, ...r, id: i + 1 }) as T);
}

export const DEFAULT_PROFILE = content.profile as Profile;

export const DEFAULT_ROWS: Record<string, unknown[]> = {
  research_areas: withIds<ResearchArea>(content.research_areas, {
    title_ne: '', description_en: '', description_ne: '',
  }),
  publications: withIds<Publication>(content.publications, {
    title_ne: '', authors: '', venue: '', url: '', pdf_url: '', kind: 'article',
  }),
  awards: withIds<Award>(content.awards as Raw[], {}),
  courses: withIds<Course>(content.courses, {}),
};

export type Localized = { en: string; ne: string };

export const HOME = content.home;
