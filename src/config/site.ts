/**
 * SECTIONS & ADDRESSES
 * --------------------
 * The site's sections, in menu order. For each one you can change:
 *  - `slug`  : the web address in each language (https://site/fr/<slug>)
 *  - `label` : the name shown in the menu and on the object in the dojo
 *  - `kanji` : the small Japanese accent shown next to the title
 *
 * The `id` is used internally (scene object, content) — don't change it.
 * Where each section's object sits in the dojo is in `src/config/experience.ts` (hotspots).
 */

export const LANGS = ['fr', 'en'] as const
export type Lang = (typeof LANGS)[number]
/** The language used for the landing page (the bare domain "/"). */
export const DEFAULT_LANG: Lang = 'fr'

export type Localized<T = string> = Record<Lang, T>

export const SECTION_IDS = [
  'about',
  'sensei',
  'schedule',
  'calendar',
  'blackBelts',
  'links',
  'contact',
] as const
export type SectionId = (typeof SECTION_IDS)[number]

export interface SectionMeta {
  slug: Localized
  label: Localized
  kanji: string
  /** Short hint shown under the label on the dojo object */
  hint: Localized
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  about: {
    slug: { fr: 'a-propos', en: 'about' },
    label: { fr: 'À propos', en: 'About' },
    kanji: '道',
    hint: { fr: 'Le dojo et ses valeurs', en: 'The dojo and its values' },
  },
  sensei: {
    slug: { fr: 'sensei', en: 'sensei' },
    label: { fr: 'Sensei', en: 'Sensei' },
    kanji: '先生',
    hint: { fr: 'Les enseignants', en: 'Our instructors' },
  },
  schedule: {
    slug: { fr: 'horaire', en: 'schedule' },
    label: { fr: 'Horaire', en: 'Schedule' },
    kanji: '稽古',
    hint: { fr: 'Les cours de la semaine', en: 'Weekly classes' },
  },
  calendar: {
    slug: { fr: 'calendrier', en: 'calendar' },
    label: { fr: 'Calendrier', en: 'Calendar' },
    kanji: '暦',
    hint: { fr: 'Passages de grade, tournois, stages', en: 'Gradings, tournaments, seminars' },
  },
  blackBelts: {
    slug: { fr: 'ceintures-noires', en: 'black-belts' },
    label: { fr: 'Ceintures noires', en: 'Black belts' },
    kanji: '有段者',
    hint: { fr: 'Nos ceintures noires', en: 'Our black belts' },
  },
  links: {
    slug: { fr: 'liens', en: 'links' },
    label: { fr: 'Liens', en: 'Links' },
    kanji: '縁',
    hint: { fr: 'Fédérations et réseaux', en: 'Federations and social' },
  },
  contact: {
    slug: { fr: 'contact', en: 'contact' },
    label: { fr: 'Contact', en: 'Contact' },
    kanji: '訪',
    hint: { fr: 'Nous trouver, nous écrire', en: 'Find us, write to us' },
  },
}
