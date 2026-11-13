/**
 * Tiny router: each section is its own page.
 *   /fr/            home (photo + menu)
 *   /fr/horaire     Schedule page, /en/schedule in English …
 * Links are shareable, reload works, and Back / Forward move between pages.
 */
import { useSyncExternalStore } from 'react'
import { DEFAULT_LANG, LANGS, SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'

export interface Route {
  lang: Lang
  section: SectionId | null
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function routeToPath(route: Route): string {
  const slug = route.section ? SECTIONS[route.section].slug[route.lang] : ''
  return `${BASE}/${route.lang}/${slug}`
}

export function parsePath(pathname: string): Route | null {
  let path = pathname
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length)
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts.length === 0) return { lang: DEFAULT_LANG, section: null }
  const lang = parts[0] as Lang
  if (!LANGS.includes(lang)) return null
  if (parts.length === 1) return { lang, section: null }
  if (parts.length > 2) return null
  const section = SECTION_IDS.find((id) => SECTIONS[id].slug[lang] === parts[1])
  return section ? { lang, section } : null
}

const listeners = new Set<() => void>()
let current: Route = readLocation()

function readLocation(): Route {
  return parsePath(window.location.pathname) ?? { lang: DEFAULT_LANG, section: null }
}
function setCurrent(next: Route) {
  if (next.lang === current.lang && next.section === current.section) return
  current = next
  listeners.forEach((l) => l())
}

window.addEventListener('popstate', () => setCurrent(readLocation()))

/** Normalise the address once at start-up ("/" → "/fr/", unknown → "/fr/"). */
export function normaliseInitialUrl() {
  const canonical = routeToPath(readLocation())
  if (window.location.pathname !== canonical) window.history.replaceState(null, '', canonical + window.location.search)
  current = readLocation()
}

/** Open a page (section: null = home). */
export function navigate(route: Route) {
  const path = routeToPath(route)
  if (path !== window.location.pathname) window.history.pushState(null, '', path + window.location.search)
  setCurrent(route)
}

/** For links: keep real hrefs (new tab / copy link) but navigate in-page on a normal click. */
export function linkClick(e: React.MouseEvent<HTMLAnchorElement>, route: Route, after?: () => void) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  after?.()
  navigate(route)
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}

export function getRoute() {
  return current
}
