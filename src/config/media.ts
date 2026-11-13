/**
 * PHOTOS
 * ------
 * Files live in `public/images/…` (write paths without "public").
 * Replace the stock photos with real photos of the dojo whenever you have them;
 * keep the same file names, or change the paths here.
 *
 * Each image needs one file per width in `widths`, in JPG and WebP:
 *   hall-1280.jpg  hall-1280.webp  hall-1920.jpg  hall-1920.webp …
 * (Free tool: https://squoosh.app — resize, then export as JPG and WebP.)
 */

import type { SectionId } from './site'

export interface ResponsiveImage {
  /** Path without size/extension, e.g. '/images/dojo/hall' → hall-1280.webp, hall-1920.jpg … */
  base: string
  /** Widths available for this image */
  widths: number[]
  /** Short description for screen readers (FR / EN) */
  alt: { fr: string; en: string }
  /** Point of interest (CSS object-position), kept in view when the image is cropped */
  focus?: string
}

/** The hall photo — used for several section-page banners. */
export const hero = {
  image: {
    base: '/images/dojo/hall',
    widths: [1280, 1920, 2560],
    alt: {
      fr: 'Grande salle japonaise traditionnelle aux tatamis, ouverte sur un jardin',
      en: 'Large traditional Japanese hall with tatami floor, open onto a garden',
    },
    focus: '42% 55%',
  } as ResponsiveImage,
}

/**
 * HOME PAGE COLLAGE
 * -----------------
 * Rows of photos drifting slowly behind the dojo's name and menu.
 * Each photo is `public/images/collage/<file>.webp` + `.jpg` (720×480 px is plenty).
 * Add, remove or reorder freely; rows are filled from this list in turn.
 */
export interface CollagePhoto {
  file: string
  alt: { fr: string; en: string }
}

export const collage = {
  /** Number of moving rows (3–5 looks best) */
  rows: 4,
  /** Seconds for a row to scroll by one full set of photos (higher = slower) */
  secondsPerLoop: 110,
  photos: [
    { file: 'fuji-sunset', alt: { fr: 'Le mont Fuji au coucher du soleil', en: 'Mount Fuji at sunset' } },
    { file: 'mtl-skyline-mount-royal', alt: { fr: 'Le centre-ville de Montréal vu du mont Royal', en: 'Downtown Montreal seen from Mount Royal' } },
    { file: 'pagoda-blossoms', alt: { fr: 'Pagode et cerisiers en fleurs', en: 'Pagoda and cherry blossoms' } },
    { file: 'mtl-old-port', alt: { fr: 'Le Vieux-Port de Montréal et le pont Jacques-Cartier', en: 'Montreal Old Port and the Jacques-Cartier Bridge' } },
    { file: 'fushimi-inari', alt: { fr: 'Les torii de Fushimi Inari, à Kyoto', en: 'Fushimi Inari torii gates, Kyoto' } },
    { file: 'fuji-chureito-pagoda', alt: { fr: 'La pagode Chureito devant le mont Fuji', en: 'Chureito pagoda in front of Mount Fuji' } },
    { file: 'mtl-bonsecours', alt: { fr: 'Le dôme du marché Bonsecours, Vieux-Montréal', en: 'Bonsecours Market dome, Old Montreal' } },
    { file: 'cherry-reflection', alt: { fr: 'Cerisiers en fleurs reflétés dans l’eau', en: 'Cherry trees in bloom reflected in water' } },
    { file: 'kinkakuji', alt: { fr: 'Le Pavillon d’or (Kinkaku-ji), Kyoto', en: 'The Golden Pavilion (Kinkaku-ji), Kyoto' } },
    { file: 'mtl-biosphere', alt: { fr: 'La Biosphère de Montréal', en: 'The Montreal Biosphere' } },
    { file: 'meguro-canal-night', alt: { fr: 'Cerisiers illuminés le long d’un canal à Tokyo', en: 'Illuminated cherry trees along a Tokyo canal' } },
    { file: 'yasaka-pagoda', alt: { fr: 'La pagode Yasaka dans une rue de Kyoto', en: 'Yasaka pagoda above a Kyoto street' } },
    { file: 'mtl-old-montreal-street', alt: { fr: 'Rue pavée du Vieux-Montréal', en: 'Cobblestone street in Old Montreal' } },
    { file: 'fuji-cherry-blossoms', alt: { fr: 'Le mont Fuji encadré de cerisiers', en: 'Mount Fuji framed by cherry blossoms' } },
    { file: 'mtl-skyline-night', alt: { fr: 'Montréal la nuit, au bord du fleuve', en: 'Montreal at night by the river' } },
    { file: 'kiyomizu-sunset', alt: { fr: 'Temple Kiyomizu-dera au crépuscule', en: 'Kiyomizu-dera temple at dusk' } },
    { file: 'mtl-grande-roue', alt: { fr: 'La Grande Roue et le Vieux-Port au crépuscule', en: 'The Grande Roue and Old Port at dusk' } },
  ] as CollagePhoto[],
}

const hall = (focus: string): ResponsiveImage => ({ ...hero.image, focus })

export const sectionImages = {
  about: {
    base: '/images/dojo/room',
    widths: [1200],
    alt: { fr: 'Pièce japonaise traditionnelle avec cloisons shoji', en: 'Traditional Japanese room with shoji screens' },
  } as ResponsiveImage,
  classes: {
    base: '/images/dojo/class',
    widths: [1600],
    alt: { fr: 'Élèves en karategi assis devant leur sensei', en: 'Students in karate gi seated in front of their sensei' },
    focus: '50% 18%',
  } as ResponsiveImage,
}

/**
 * Banner photo at the top of each section page (replace with real dojo photos later).
 * `focus` picks which part of the photo stays visible in the wide, short banner.
 */
export const pageBanners: Record<SectionId, ResponsiveImage> = {
  about: { ...sectionImages.about, focus: '50% 60%' },
  sensei: hall('8% 40%'),
  schedule: sectionImages.classes,
  calendar: hall('80% 55%'),
  blackBelts: { ...sectionImages.classes, focus: '55% 35%' },
  links: { ...sectionImages.about, focus: '70% 50%' },
  contact: hall('62% 62%'),
}
