/** Visitor preferences, stored safely (storage may be unavailable in private mode). */

const MOTION_KEY = 'dojo:motion' // 'full' | 'reduced' (localStorage: remembered across visits)
const INTRO_KEY = 'dojo:intro-seen' // sessionStorage: this browser session only

function safeGet(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key)
  } catch {
    return null
  }
}
function safeSet(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value)
  } catch {
    /* storage blocked — preference simply isn't remembered */
  }
}

export type MotionPref = 'full' | 'reduced'

export function systemPrefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Saved choice wins; otherwise follow the operating-system setting. */
export function loadMotionPref(): MotionPref {
  const saved = safeGet(() => localStorage, MOTION_KEY)
  if (saved === 'full' || saved === 'reduced') return saved
  return systemPrefersReducedMotion() ? 'reduced' : 'full'
}
export function saveMotionPref(value: MotionPref) {
  safeSet(() => localStorage, MOTION_KEY, value)
}

export function hasSeenIntro(): boolean {
  return safeGet(() => sessionStorage, INTRO_KEY) === '1'
}
export function markIntroSeen() {
  safeSet(() => sessionStorage, INTRO_KEY, '1')
}
