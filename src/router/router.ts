/**
 * Minimal path router: /fr/, /fr/horaire, /en/schedule …
 * The URL is the single source of truth for the language and the open section,
 * so links are shareable and the browser's back/forward buttons work.
 */
import { useSyncExternalStore } from 'react'
import { DEFAULT_LANG, LANGS, SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'

export interface Route {
  lang: Lang
  section: SectionId | null
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') // '' or '/sub'

export function routeToPath(route: Route): string {
  const slug = route.section ? SECTIONS[route.section].slug[route.lang] : ''
  return `${BASE}/${route.lang}/${slug}`
}

/** Returns the route, or null when the path is not a valid page. */
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

interface HistoryState {
  /** true when this entry was pushed by opening a section from the dojo view */
  fromDojo?: boolean
}

type Listener = () => void
const listeners = new Set<Listener>()
let current: Route = readLocation()

function readLocation(): Route {
  return parsePath(window.location.pathname) ?? { lang: DEFAULT_LANG, section: null }
}

function emit() {
  const next = readLocation()
  if (next.lang !== current.lang || next.section !== current.section) {
    current = next
    listeners.forEach((l) => l())
  }
}

window.addEventListener('popstate', emit)

/** Normalise the address bar once at start-up ("/" → "/fr/", unknown → "/fr/"). */
export function normaliseInitialUrl(): boolean {
  const parsed = parsePath(window.location.pathname)
  const valid = parsed !== null
  const canonical = routeToPath(readLocation())
  if (window.location.pathname !== canonical) {
    window.history.replaceState(window.history.state, '', canonical + window.location.search + window.location.hash)
  }
  current = readLocation()
  return valid
}

export function navigate(route: Route, opts: { replace?: boolean } = {}) {
  const path = routeToPath(route)
  if (path === window.location.pathname) return
  const state: HistoryState = { fromDojo: !opts.replace && current.section === null && route.section !== null }
  if (opts.replace) window.history.replaceState(state, '', path + window.location.search)
  else window.history.pushState(state, '', path + window.location.search)
  emit()
}

/** Close the open section: step back in history when it was opened from the dojo, so Back stays tidy. */
export function closeSection() {
  const state = window.history.state as HistoryState | null
  if (state?.fromDojo) window.history.back()
  else navigate({ lang: current.lang, section: null })
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

export function getRoute(): Route {
  return current
}
