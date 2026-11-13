/**
 * Tiny router for a one-page site: /fr/, /fr/horaire, /en/schedule …
 *
 * - Clicking a menu link calls `navigate()`: the address changes (shareable, Back works)
 *   and the page scrolls to that section.
 * - Scrolling by hand calls `syncRoute()`: the address follows the section in view
 *   without adding history entries and without scrolling.
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

const routeListeners = new Set<() => void>()
const scrollListeners = new Set<(route: Route, smooth: boolean) => void>()
let current: Route = readLocation()

function readLocation(): Route {
  return parsePath(window.location.pathname) ?? { lang: DEFAULT_LANG, section: null }
}
function setCurrent(next: Route) {
  if (next.lang === current.lang && next.section === current.section) return
  current = next
  routeListeners.forEach((l) => l())
}

window.addEventListener('popstate', () => {
  setCurrent(readLocation())
  scrollListeners.forEach((l) => l(current, true))
})

/** Normalise the address once at start-up ("/" → "/fr/", unknown → "/fr/"). */
export function normaliseInitialUrl() {
  const canonical = routeToPath(readLocation())
  if (window.location.pathname !== canonical) window.history.replaceState(null, '', canonical + window.location.search + window.location.hash)
  current = readLocation()
}

/** Go to a section (or the top with section: null) — updates the address and scrolls. */
export function navigate(route: Route, opts: { smooth?: boolean } = {}) {
  const path = routeToPath(route)
  if (path !== window.location.pathname) window.history.pushState(null, '', path + window.location.search)
  setCurrent(route)
  scrollListeners.forEach((l) => l(route, opts.smooth ?? true))
}

/** Keep the address in step with the section in view (no history entry, no scrolling). */
export function syncRoute(route: Route) {
  const path = routeToPath(route)
  if (path !== window.location.pathname) window.history.replaceState(null, '', path + window.location.search)
  setCurrent(route)
}

export function onScrollRequest(cb: (route: Route, smooth: boolean) => void) {
  scrollListeners.add(cb)
  return () => {
    scrollListeners.delete(cb)
  }
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      routeListeners.add(l)
      return () => routeListeners.delete(l)
    },
    () => current,
  )
}

export function getRoute() {
  return current
}
