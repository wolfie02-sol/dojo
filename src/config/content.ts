/**
 * ============================================================================
 *  DOJO CONTENT — the one file to edit for the dojo's business information.
 * ============================================================================
 *
 * Every text has a French (`fr`) and an English (`en`) version.
 *
 * Placeholders
 *  - Any value set to `null` is shown on the site as "Details coming soon".
 *  - Items with `placeholder: true` show a small "Example" badge so visitors
 *    know the content is not final. Remove the flag (or set it to false)
 *    once you put in real information.
 *
 * Photos
 *  - Put image files in `public/images/` (e.g. `public/images/sensei/name.jpg`)
 *    and write the path without "public": `'/images/sensei/name.jpg'`.
 *  - Use JPG or WebP, about 600×750 px, under ~150 KB each.
 *  - `null` shows a neutral silhouette.
 *
 * Calendar
 *  - Live events come from Google Calendar (see `calendar` below and README).
 *  - `calendar.sampleEvents` is only used while Google Calendar is not set up.
 */

import type { Lang, Localized } from './site'

type L = Localized
type MaybeL = Localized | null

/* ---------------------------------------------------------------- Identity */

export const dojo = {
  /** Dojo name, shown in the header, on the entrance and in page titles */
  name: { fr: 'Nom du dojo', en: 'Dojo name' } as L,
  /** Short line under the name on the entrance */
  tagline: {
    fr: 'Karaté Shotokan · Japan Karate Association',
    en: 'Shotokan Karate · Japan Karate Association',
  } as L,
  /** Style / affiliation, shown as a small badge */
  style: { fr: 'Karaté Shotokan JKA', en: 'JKA Shotokan Karate' } as L,
  /** Small Japanese accent above the name (Japanese only) */
  calligraphy: '空手道',
}

/* ---------------------------------------------------------- Calls to action */

export const cta = {
  /** Main button on the opening image */
  discover: { fr: 'Découvrir le dojo', en: 'Discover the dojo' } as L,
  /** Second button on the opening image */
  schedule: { fr: "Voir l'horaire", en: 'See the schedule' } as L,
  /** Main call to action at the bottom of sections (e.g. trial class) */
  primary: { fr: 'Essai gratuit — détails à venir', en: 'Free trial — details coming soon' } as L,
}

/* ------------------------------------------------------------------- About */

export const about = {
  lead: {
    fr: '[Texte d’accueil à venir] Une phrase qui présente le dojo, son esprit et à qui il s’adresse.',
    en: '[Welcome text coming soon] One sentence introducing the dojo, its spirit and who it is for.',
  } as L,
  paragraphs: [
    {
      fr: '[Historique du dojo à venir] Année de fondation, parcours, affiliation à la JKA.',
      en: '[Dojo history coming soon] Year founded, background, JKA affiliation.',
    },
    {
      fr: '[Philosophie d’enseignement à venir] Ce que les élèves y trouvent : discipline, respect, condition physique, confiance.',
      en: '[Teaching philosophy coming soon] What students find here: discipline, respect, fitness, confidence.',
    },
  ] as L[],
  /** Dojo Kun — the five maxims recited in Shotokan dojos. Edit or remove freely. */
  dojoKun: {
    title: { fr: 'Dōjō kun', en: 'Dōjō kun' } as L,
    items: [
      { jp: '一、人格完成に努むること', fr: 'Chercher la perfection du caractère', en: 'Seek perfection of character' },
      { jp: '一、誠の道を守ること', fr: 'Être fidèle', en: 'Be faithful' },
      { jp: '一、努力の精神を養うこと', fr: 'Cultiver l’effort', en: 'Endeavour' },
      { jp: '一、礼儀を重んずること', fr: 'Respecter les autres', en: 'Respect others' },
      { jp: '一、血気の勇を戒むること', fr: 'S’abstenir de toute violence', en: 'Refrain from violent behaviour' },
    ],
  },
}

/* ------------------------------------------------------------------ Sensei */

export interface Instructor {
  name: L
  /** e.g. "5e dan JKA" — null shows "Details coming soon" */
  rank: MaybeL
  role: MaybeL
  bio: MaybeL
  photo: string | null
  placeholder?: boolean
}

export const instructors: Instructor[] = [
  {
    name: { fr: 'Nom du sensei', en: 'Sensei name' },
    rank: null,
    role: { fr: 'Instructeur en chef', en: 'Chief instructor' },
    bio: {
      fr: '[Biographie à venir] Parcours, années de pratique, grade et certifications JKA.',
      en: '[Biography coming soon] Background, years of practice, rank and JKA certifications.',
    },
    photo: null,
    placeholder: true,
  },
  {
    name: { fr: 'Nom de l’assistant·e', en: 'Assistant name' },
    rank: null,
    role: { fr: 'Instructeur·rice assistant·e', en: 'Assistant instructor' },
    bio: null,
    photo: null,
    placeholder: true,
  },
]

/* ---------------------------------------------------------------- Schedule */

/** 0 = Monday … 6 = Sunday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ClassSlot {
  day: Weekday
  start: string // "18:00"
  end: string // "19:00"
  title: L
  level: MaybeL
  placeholder?: boolean
}

export const schedule = {
  note: {
    fr: 'Horaire d’exemple — à remplacer par l’horaire officiel.',
    en: 'Sample timetable — replace with the official schedule.',
  } as MaybeL,
  classes: [
    { day: 0, start: '18:00', end: '19:00', title: { fr: 'Enfants', en: 'Kids' }, level: { fr: '6–12 ans', en: 'Ages 6–12' }, placeholder: true },
    { day: 0, start: '19:15', end: '20:45', title: { fr: 'Adultes', en: 'Adults' }, level: { fr: 'Tous niveaux', en: 'All levels' }, placeholder: true },
    { day: 2, start: '18:00', end: '19:00', title: { fr: 'Enfants', en: 'Kids' }, level: { fr: '6–12 ans', en: 'Ages 6–12' }, placeholder: true },
    { day: 2, start: '19:15', end: '20:45', title: { fr: 'Kata et kumite', en: 'Kata & kumite' }, level: { fr: 'Ceintures avancées', en: 'Advanced belts' }, placeholder: true },
    { day: 5, start: '10:00', end: '11:30', title: { fr: 'Entraînement libre', en: 'Open training' }, level: null, placeholder: true },
  ] as ClassSlot[],
}

/* ---------------------------------------------------------------- Calendar */

export type EventKind = 'grading' | 'tournament' | 'seminar' | 'closure' | 'other'

export const eventKinds: Record<EventKind, { label: L; /** words in a Google event title that select this kind */ keywords: string[] }> = {
  grading: { label: { fr: 'Passage de grade', en: 'Grading' }, keywords: ['grade', 'grading', 'kyu', 'dan', 'examen', 'exam'] },
  tournament: { label: { fr: 'Tournoi', en: 'Tournament' }, keywords: ['tournoi', 'tournament', 'compétition', 'competition', 'championnat', 'championship'] },
  seminar: { label: { fr: 'Stage', en: 'Seminar' }, keywords: ['stage', 'seminar', 'séminaire', 'gasshuku', 'clinique', 'clinic'] },
  closure: { label: { fr: 'Fermeture', en: 'Closed' }, keywords: ['fermé', 'fermeture', 'closed', 'congé', 'holiday', 'relâche'] },
  other: { label: { fr: 'Événement', en: 'Event' }, keywords: [] },
}

export interface SampleEvent {
  /** "YYYY-MM-DD", or a number of days from today (handy for samples that never go stale) */
  date: string | number
  /** Optional end date for multi-day events (same format as `date`) */
  endDate?: string | number
  time?: string
  title: L
  kind: EventKind
  location?: MaybeL
}

export const calendar = {
  /**
   * Google Calendar. Put the values in a `.env` file (see `.env.example`):
   *   VITE_GOOGLE_CALENDAR_API_KEY=...   VITE_GOOGLE_CALENDAR_ID=...@group.calendar.google.com
   * Or write them directly here (the key is public anyway — restrict it to your domain in Google Cloud).
   */
  googleApiKey: (import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY as string | undefined) ?? '',
  googleCalendarId: (import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined) ?? '',
  /** Time zone used to display events */
  timeZone: 'America/Toronto',
  /** How many months ahead to load */
  monthsAhead: 12,
  /** Shown while Google Calendar is not connected */
  sampleEvents: [
    { date: 9, title: { fr: 'Passage de grade (kyu)', en: 'Kyu grading' }, kind: 'grading', time: '10:00' },
    { date: 23, endDate: 24, title: { fr: 'Stage technique', en: 'Technical seminar' }, kind: 'seminar', location: null },
    { date: 41, title: { fr: 'Tournoi régional', en: 'Regional tournament' }, kind: 'tournament' },
    { date: 55, title: { fr: 'Dojo fermé', en: 'Dojo closed' }, kind: 'closure' },
  ] as SampleEvent[],
}

/* ------------------------------------------------------------- Black belts */

/** Dan rank → display. Edit the wording freely. */
export const danNames: Record<number, { jp: string; fr: string; en: string }> = {
  1: { jp: '初段', fr: 'Shodan · 1er dan', en: 'Shodan · 1st dan' },
  2: { jp: '弐段', fr: 'Nidan · 2e dan', en: 'Nidan · 2nd dan' },
  3: { jp: '参段', fr: 'Sandan · 3e dan', en: 'Sandan · 3rd dan' },
  4: { jp: '四段', fr: 'Yondan · 4e dan', en: 'Yondan · 4th dan' },
  5: { jp: '五段', fr: 'Godan · 5e dan', en: 'Godan · 5th dan' },
  6: { jp: '六段', fr: 'Rokudan · 6e dan', en: 'Rokudan · 6th dan' },
  7: { jp: '七段', fr: 'Nanadan · 7e dan', en: 'Nanadan · 7th dan' },
  8: { jp: '八段', fr: 'Hachidan · 8e dan', en: 'Hachidan · 8th dan' },
}

export interface BlackBelt {
  name: string
  dan: number
  photo: string | null
  placeholder?: boolean
}

export const blackBelts: BlackBelt[] = [
  { name: 'Ceinture noire A', dan: 3, photo: null, placeholder: true },
  { name: 'Ceinture noire B', dan: 2, photo: null, placeholder: true },
  { name: 'Ceinture noire C', dan: 2, photo: null, placeholder: true },
  { name: 'Ceinture noire D', dan: 1, photo: null, placeholder: true },
  { name: 'Ceinture noire E', dan: 1, photo: null, placeholder: true },
  { name: 'Ceinture noire F', dan: 1, photo: null, placeholder: true },
]

/* ------------------------------------------------------------------- Links */

export interface ExternalLink {
  title: L
  description: MaybeL
  /** Full address starting with https:// — empty string shows "Link coming soon" */
  url: string
}

export const linkGroups: { title: L; links: ExternalLink[] }[] = [
  {
    title: { fr: 'Fédérations', en: 'Federations' },
    links: [
      { title: { fr: 'Japan Karate Association (JKA)', en: 'Japan Karate Association (JKA)' }, description: { fr: 'Siège mondial', en: 'World headquarters' }, url: '' },
      { title: { fr: 'Fédération nationale — à confirmer', en: 'National federation — to be confirmed' }, description: null, url: '' },
      { title: { fr: 'Association régionale — à confirmer', en: 'Regional association — to be confirmed' }, description: null, url: '' },
    ],
  },
  {
    title: { fr: 'Réseaux sociaux', en: 'Social media' },
    links: [
      { title: { fr: 'Instagram', en: 'Instagram' }, description: null, url: '' },
      { title: { fr: 'Facebook', en: 'Facebook' }, description: null, url: '' },
      { title: { fr: 'YouTube', en: 'YouTube' }, description: null, url: '' },
    ],
  },
  {
    title: { fr: 'Ressources', en: 'Resources' },
    links: [{ title: { fr: 'Dojos affiliés — à venir', en: 'Affiliated dojos — coming soon' }, description: null, url: '' }],
  },
]

/* ----------------------------------------------------------------- Contact */

export const contact = {
  /** Lines of the address, or null */
  address: null as string[] | null,
  phone: null as string | null,
  email: null as string | null,
  /** Opening hours of the front desk, if different from the class schedule */
  hours: null as MaybeL,
  /** Link to the location in Google Maps / Apple Maps */
  mapUrl: '' as string,
  directions: null as MaybeL,
  /**
   * Contact form: intentionally not shown until a service is connected.
   * Integration point: `src/ui/sections/ContactSection.tsx` → `ContactFormSlot`.
   */
  formEnabled: false,
}

/* ---------------------------------------------------------------- Helpers */

export function t(value: Localized, lang: Lang): string {
  return value[lang]
}
