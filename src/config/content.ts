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
  name: { fr: 'Haku Rō', en: 'Haku Rō' } as L,
  /** Short line under the name on the entrance */
  tagline: {
    fr: 'Karaté Shotokan · Japan Karate Association',
    en: 'Shotokan Karate · Japan Karate Association',
  } as L,
  /** Style / affiliation, shown as a small badge */
  style: { fr: 'Karaté Shotokan JKA', en: 'JKA Shotokan Karate' } as L,
  /** Small Japanese accent (Japanese only) */
  calligraphy: '空手道',
  /** The dojo's name in kanji (白狼 = white wolf) */
  kanjiName: '白狼',
  /**
   * Logo files in public/images/logo/:
   *  - full:  the complete logo, transparent background (for light backgrounds)
   *  - badge: the complete logo on a cream tile (for photos and dark backgrounds)
   *  - mark:  the wolf disc only, square (browser tab icon, small spaces)
   */
  logo: {
    full: '/images/logo/hakuro-logo.svg',
    badge: '/images/logo/hakuro-badge.svg',
    mark: '/images/logo/hakuro-mark.svg',
  },
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
  /**
   * Dojo Kun — wording of JKA-SKD Canada's ethics code (French and English versions).
   * `romaji` is the Japanese read aloud at the end of class.
   */
  dojoKun: {
    title: { fr: 'Dojo Kun (préceptes du Dojo)', en: 'Dojo Kun (precepts of the Dojo)' } as L,
    items: [
      { romaji: 'Hitotsu, Jinkaku kansei ni tsutomuru koto', fr: 'Recherche la perfection du caractère', en: 'Seek perfection of character' },
      { romaji: 'Hitotsu, Makoto no michi o mamoru koto', fr: 'Sois loyal', en: 'Be Faithful' },
      { romaji: 'Hitotsu, Doryoku no seishin o yashinau koto', fr: 'Surpasse-toi', en: 'Endeavor' },
      { romaji: 'Hitotsu, Reigi o omonzuru koto', fr: 'Respecte les autres', en: 'Respect others' },
      { romaji: 'Hitotsu, Kekki no yuu o imashimuru koto', fr: 'Abstiens-toi de conduite violente', en: 'Refrain from violent behavior' },
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
    name: { fr: 'Manon Quirion', en: 'Manon Quirion' },
    rank: { fr: 'Nana (7e) Dan', en: 'Nana (7th) Dan' },
    role: { fr: 'Sensei', en: 'Sensei' },
    bio: {
      fr: '[Biographie à venir] Parcours, années de pratique et certifications.',
      en: '[Biography coming soon] Background, years of practice and certifications.',
    },
    photo: null,
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
  1: { jp: '初段', fr: 'Sho (1e) Dan', en: 'Sho (1st) Dan' },
  2: { jp: '弐段', fr: 'Ni (2e) Dan', en: 'Ni (2nd) Dan' },
  3: { jp: '参段', fr: 'San (3e) Dan', en: 'San (3rd) Dan' },
  4: { jp: '四段', fr: 'Yon (4e) Dan', en: 'Yon (4th) Dan' },
  5: { jp: '五段', fr: 'Go (5e) Dan', en: 'Go (5th) Dan' },
  6: { jp: '六段', fr: 'Roku (6e) Dan', en: 'Roku (6th) Dan' },
  7: { jp: '七段', fr: 'Nana (7e) Dan', en: 'Nana (7th) Dan' },
  8: { jp: '八段', fr: 'Hachi (8e) Dan', en: 'Hachi (8th) Dan' },
}

export interface BlackBelt {
  name: string
  dan: number
  photo: string | null
  placeholder?: boolean
}

export const blackBelts: BlackBelt[] = [
  { name: 'Sensei Manon Quirion', dan: 7, photo: null },
  { name: 'Robert Lacerte', dan: 5, photo: null },
  { name: 'Nadia Hardy', dan: 5, photo: null },
  { name: 'Jean-Pierre Houle', dan: 5, photo: null },
  { name: 'Christine Roux', dan: 4, photo: null },
  { name: 'Xin Yi Fan', dan: 3, photo: null },
  { name: 'Laurence Blain', dan: 3, photo: null },
  { name: 'Marc Piccin', dan: 3, photo: null },
  { name: 'Joseph Raad', dan: 3, photo: null },
  { name: 'Fréderick Vinette', dan: 3, photo: null },
  { name: 'Kelly Yan', dan: 3, photo: null },
  { name: 'Guilherme Tavares-Machado', dan: 3, photo: null },
  { name: 'Etienne Duquette', dan: 2, photo: null },
  { name: 'Ana Martina Botti', dan: 1, photo: null },
  { name: 'Paul Arnoux', dan: 1, photo: null },
  { name: 'Emilie Fayertes', dan: 1, photo: null },
  { name: 'Eméry Facal-Montpetit', dan: 1, photo: null },
  { name: 'Gabrielle Ouellette', dan: 1, photo: null },
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
      {
        title: { fr: 'Association de karaté JKA du Québec (AKJKAQ)', en: 'JKA Karate Association of Quebec (AKJKAQ)' },
        description: { fr: 'Association provinciale', en: 'Provincial association' },
        url: 'https://www.akjkaq.ca/',
      },
      {
        title: { fr: 'JKA SKD Canada', en: 'JKA SKD Canada' },
        description: { fr: 'Organisation nationale', en: 'National organization' },
        url: 'https://www.jkaskd.ca/index.htm',
      },
      {
        title: { fr: 'Association Japonaise de Karaté (JKA)', en: 'Japan Karate Association (JKA)' },
        description: { fr: 'Siège mondial, Japon', en: 'World headquarters, Japan' },
        url: 'https://www.jka.or.jp/en/',
      },
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
