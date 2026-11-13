/** Month view + day detail + upcoming list. Data: Google Calendar or sample events (src/lib/calendar.ts). */
import { useEffect, useMemo, useState } from 'react'
import { calendar, eventKinds, type EventKind } from '../../config/content'
import type { Lang } from '../../config/site'
import { UI } from '../../i18n/ui'
import { addDays, eventsOn, keyToDate, loadEvents, todayKey, type CalEvent, type CalendarResult } from '../../lib/calendar'
import { IconChevron } from '../Icons'
import { ExampleBadge } from '../Placeholder'

const locale = (lang: Lang) => (lang === 'fr' ? 'fr-CA' : 'en-CA')

function KindTag({ kind, lang }: { kind: EventKind; lang: Lang }) {
  return <span className={`kind kind--${kind}`}>{eventKinds[kind].label[lang]}</span>
}

function EventItem({ e, lang, showDate }: { e: CalEvent; lang: Lang; showDate: boolean }) {
  const ui = UI[lang]
  const fmt = new Intl.DateTimeFormat(locale(lang), { weekday: 'short', day: 'numeric', month: 'long' })
  const range = e.endKey !== e.startKey ? `${fmt.format(keyToDate(e.startKey))} – ${fmt.format(keyToDate(e.endKey))}` : fmt.format(keyToDate(e.startKey))
  return (
    <li className="event">
      {showDate && (
        <time className="event__date" dateTime={e.startKey}>
          {range}
        </time>
      )}
      <span className="event__title">
        {e.url ? (
          <a href={e.url} target="_blank" rel="noopener noreferrer">
            {e.title}
          </a>
        ) : (
          e.title
        )}
      </span>
      <span className="event__meta">
        <KindTag kind={e.kind} lang={lang} />
        <span>{e.time ?? ui.allDay}</span>
        {e.location && <span>{e.location}</span>}
      </span>
    </li>
  )
}

export function CalendarSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const [result, setResult] = useState<CalendarResult | null>(null)
  const today = todayKey()
  const [month, setMonth] = useState(() => today.slice(0, 7)) // "YYYY-MM"
  const [selected, setSelected] = useState(today)

  useEffect(() => {
    let alive = true
    loadEvents(lang).then((r) => alive && setResult(r))
    return () => {
      alive = false
    }
  }, [lang])

  const events = useMemo(() => result?.events ?? [], [result])

  const cells = useMemo(() => {
    const first = `${month}-01`
    const d = keyToDate(first)
    const offset = (d.getDay() + 6) % 7 // Monday first
    const start = addDays(first, -offset)
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const total = Math.ceil((offset + daysInMonth) / 7) * 7
    return Array.from({ length: total }, (_, i) => addDays(start, i))
  }, [month])

  const shiftMonth = (n: number) => {
    const d = keyToDate(`${month}-01`)
    d.setMonth(d.getMonth() + n)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = new Intl.DateTimeFormat(locale(lang), { month: 'long', year: 'numeric' }).format(keyToDate(`${month}-01`))
  const weekdayFmt = new Intl.DateTimeFormat(locale(lang), { weekday: 'short' })
  const dayFmt = new Intl.DateTimeFormat(locale(lang), { weekday: 'long', day: 'numeric', month: 'long' })
  const upcoming = events.filter((e) => e.endKey >= today).slice(0, 6)
  const dayEvents = eventsOn(events, selected)

  return (
    <>
      <p className="notice" role="status">
        {!result && ui.calendarLoading}
        {result?.source === 'sample' && (
          <>
            <ExampleBadge lang={lang} /> {ui.calendarSample}
          </>
        )}
        {result?.source === 'google' && ui.calendarLive}
        {result?.source === 'error' && ui.calendarError}
      </p>

      <div className="cal" aria-busy={!result}>
        <div className="cal__head">
          <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label={ui.prevMonth}>
            <IconChevron dir="left" />
          </button>
          <h3 className="cal__month" aria-live="polite">
            {monthLabel}
          </h3>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label={ui.nextMonth}>
            <IconChevron />
          </button>
        </div>
        <div className="cal__grid" role="grid" aria-label={monthLabel}>
          <div role="row" className="cal__row">
            {cells.slice(0, 7).map((k) => (
              <span role="columnheader" key={k} className="cal__wd">
                {weekdayFmt.format(keyToDate(k)).replace('.', '')}
              </span>
            ))}
          </div>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <div role="row" className="cal__row" key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((k) => {
                const evs = eventsOn(events, k)
                const outside = !k.startsWith(month)
                return (
                  <span role="gridcell" key={k} aria-selected={k === selected}>
                    <button
                      type="button"
                      className={`cal__day${outside ? ' is-outside' : ''}${k === today ? ' is-today' : ''}${k === selected ? ' is-selected' : ''}`}
                      onClick={() => setSelected(k)}
                      aria-label={`${dayFmt.format(keyToDate(k))}${evs.length ? ` — ${evs.map((e) => e.title).join(', ')}` : ''}`}
                      aria-current={k === today ? 'date' : undefined}
                    >
                      <span>{Number(k.slice(8))}</span>
                      {evs.length > 0 && (
                        <span className="cal__dots" aria-hidden="true">
                          {evs.slice(0, 3).map((e) => (
                            <i key={e.id} className={`dot dot--${e.kind}`} />
                          ))}
                        </span>
                      )}
                    </button>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        <button type="button" className="btn-text cal__today" onClick={() => { setMonth(today.slice(0, 7)); setSelected(today) }}>
          {ui.today}
        </button>
      </div>

      <section className="cal__detail" aria-labelledby="cal-day">
        <h3 id="cal-day" className="subhead">
          {ui.eventsOn} {dayFmt.format(keyToDate(selected))}
        </h3>
        {dayEvents.length ? (
          <ul className="events">
            {dayEvents.map((e) => (
              <EventItem key={e.id} e={e} lang={lang} showDate={false} />
            ))}
          </ul>
        ) : (
          <p className="muted">{ui.noEventsDay}</p>
        )}
      </section>

      <section aria-labelledby="cal-up">
        <h3 id="cal-up" className="subhead">
          {ui.upcoming}
        </h3>
        {upcoming.length ? (
          <ul className="events">
            {upcoming.map((e) => (
              <EventItem key={e.id} e={e} lang={lang} showDate />
            ))}
          </ul>
        ) : (
          <p className="muted">{result ? ui.noEvents : ui.calendarLoading}</p>
        )}
      </section>
      <p className="legend">
        {(Object.keys(eventKinds) as EventKind[]).map((k) => (
          <KindTag key={k} kind={k} lang={lang} />
        ))}
      </p>
      <p className="muted small">{calendar.timeZone.replace('_', ' ')}</p>
    </>
  )
}
