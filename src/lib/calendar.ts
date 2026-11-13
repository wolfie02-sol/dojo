/**
 * Calendar data: Google Calendar when configured (src/config/content.ts → calendar),
 * otherwise the sample events. Results are cached for the visit.
 *
 * Google Calendar setup (summary — full steps in README):
 *  1. Make the calendar public (Settings → Access permissions → "Make available to public").
 *  2. Copy its Calendar ID (Settings → Integrate calendar).
 *  3. In Google Cloud Console, enable "Google Calendar API" and create an API key,
 *     restricted to your website's address (HTTP referrers) and to the Calendar API.
 *  4. Put both values in `.env` (VITE_GOOGLE_CALENDAR_API_KEY / VITE_GOOGLE_CALENDAR_ID) and rebuild.
 */
import { calendar, eventKinds, type EventKind, type SampleEvent } from '../config/content'
import type { Lang } from '../config/site'

export interface CalEvent {
  id: string
  title: string
  /** First and last day (inclusive) as "YYYY-MM-DD" in the dojo's time zone */
  startKey: string
  endKey: string
  /** "18:00" for timed events, null for all-day */
  time: string | null
  kind: EventKind
  location: string | null
  url: string | null
}

export type CalendarResult = { source: 'sample' | 'google'; events: CalEvent[] } | { source: 'error'; events: CalEvent[] }

export const isGoogleConfigured = () => Boolean(calendar.googleApiKey && calendar.googleCalendarId)

const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: calendar.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
const timeFmt = new Intl.DateTimeFormat('fr-CA', { timeZone: calendar.timeZone, hour: '2-digit', minute: '2-digit', hour12: false })

/** "YYYY-MM-DD" for an instant, in the dojo's time zone */
export const dateKey = (d: Date) => keyFmt.format(d)
export const todayKey = () => dateKey(new Date())

export function keyToDate(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
export function addDays(key: string, n: number) {
  const d = keyToDate(key)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function detectKind(text: string): EventKind {
  const t = text.toLowerCase()
  for (const kind of Object.keys(eventKinds) as EventKind[]) {
    if (eventKinds[kind].keywords.some((k) => t.includes(k))) return kind
  }
  return 'other'
}

function sampleEvents(lang: Lang): CalEvent[] {
  const resolve = (v: string | number) => (typeof v === 'number' ? addDays(todayKey(), v) : v)
  return calendar.sampleEvents.map((e: SampleEvent, i) => ({
    id: `sample-${i}`,
    title: e.title[lang],
    startKey: resolve(e.date),
    endKey: resolve(e.endDate ?? e.date),
    time: e.time ?? null,
    kind: e.kind,
    location: e.location ? e.location[lang] : null,
    url: null,
  }))
}

interface GoogleItem {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start: { date?: string; dateTime?: string }
  end: { date?: string; dateTime?: string }
}

let googleCache: Promise<CalEvent[]> | null = null

async function fetchGoogle(): Promise<CalEvent[]> {
  const now = new Date()
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const timeMax = new Date(now.getFullYear(), now.getMonth() + calendar.monthsAhead + 1, 1).toISOString()
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.googleCalendarId)}/events`)
  url.search = new URLSearchParams({ key: calendar.googleApiKey, singleEvents: 'true', orderBy: 'startTime', timeMin, timeMax, maxResults: '250' }).toString()
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Google Calendar ${res.status}`)
  const data = (await res.json()) as { items?: GoogleItem[] }
  return (data.items ?? []).map((item) => {
    const allDay = Boolean(item.start.date)
    const startKey = allDay ? item.start.date! : dateKey(new Date(item.start.dateTime!))
    // all-day end dates are exclusive in Google Calendar
    const endKey = allDay ? addDays(item.end.date ?? item.start.date!, -1) : dateKey(new Date(item.end.dateTime ?? item.start.dateTime!))
    return {
      id: item.id,
      title: item.summary ?? '',
      startKey,
      endKey: endKey < startKey ? startKey : endKey,
      time: allDay ? null : timeFmt.format(new Date(item.start.dateTime!)),
      kind: detectKind(`${item.summary ?? ''} ${item.description ?? ''}`),
      location: item.location ?? null,
      url: item.htmlLink ?? null,
    }
  })
}

export async function loadEvents(lang: Lang): Promise<CalendarResult> {
  if (!isGoogleConfigured()) return { source: 'sample', events: sampleEvents(lang) }
  try {
    googleCache ??= fetchGoogle()
    return { source: 'google', events: await googleCache }
  } catch (err) {
    console.warn('[dojo] calendar:', err)
    googleCache = null
    return { source: 'error', events: [] }
  }
}

/** Events that cover a given day */
export const eventsOn = (events: CalEvent[], key: string) => events.filter((e) => e.startKey <= key && e.endKey >= key)
