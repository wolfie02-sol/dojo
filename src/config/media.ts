/**
 * PHOTOS & VIDEO
 * --------------
 * Files live in `public/images/…` (write paths without "public").
 * Replace the stock photos with real photos of the dojo whenever you have them;
 * keep the same file names, or change the paths here.
 *
 * Each image needs one file per width in `widths`, in JPG and WebP:
 *   hall-1280.jpg  hall-1280.webp  hall-1920.jpg  hall-1920.webp …
 * (Free tool: https://squoosh.app — resize, then export as JPG and WebP.)
 */

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

  /**
   * Optional background VIDEO (e.g. a slow walk into the dojo filmed on a phone or gimbal).
   * Set to null to use the photo. When set, the photo is used as the poster and on reduced motion.
   * Encode as H.264 MP4, 1920×1080, 10–20 s, no sound, ~4–8 MB (command in README).
   */
  video: null as null | { mp4: string; mp4Mobile?: string },

  /** Slow "walking in" zoom on the photo/video when the page opens */
  zoom: {
    /** Final scale of the opening move (1 = no zoom) */
    scale: 1.14,
    /** Length of the opening move, seconds */
    duration: 14,
    /** Point the camera moves towards (CSS transform-origin) */
    origin: '40% 52%',
    /** Extra zoom applied while scrolling past the hero (0 = off) */
    scrollScale: 0.08,
  },
}

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
