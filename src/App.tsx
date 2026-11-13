import { useEffect, useLayoutEffect, useRef, type ComponentType } from 'react'
import { dojo } from './config/content'
import { sectionImages } from './config/media'
import { LANGS, SECTIONS, SECTION_IDS, type Lang, type SectionId } from './config/site'
import { UI } from './i18n/ui'
import { getRoute, navigate, onScrollRequest, routeToPath, syncRoute, useRoute } from './router/router'
import { Hero } from './ui/Hero'
import { Picture } from './ui/Picture'
import { SiteHeader } from './ui/SiteHeader'
import { AboutSection, BlackBeltsSection, ContactSection, LinksSection, ScheduleSection, SenseiSection } from './ui/sections/Sections'
import { CalendarSection } from './ui/sections/CalendarSection'

const CONTENT: Record<SectionId, ComponentType<{ lang: Lang }>> = {
  about: AboutSection,
  sensei: SenseiSection,
  schedule: ScheduleSection,
  calendar: CalendarSection,
  blackBelts: BlackBeltsSection,
  links: LinksSection,
  contact: ContactSection,
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scroll to a section (or the top) and move keyboard focus to its heading. */
function scrollToSection(section: SectionId | null, smooth: boolean, moveFocus = true) {
  const behavior: ScrollBehavior = smooth && !reducedMotion() ? 'smooth' : 'auto'
  if (!section) {
    window.scrollTo({ top: 0, behavior })
    return
  }
  const el = document.getElementById(section)
  if (!el) return
  el.scrollIntoView({ behavior, block: 'start' })
  if (moveFocus) el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}

export function App() {
  const route = useRoute()
  const ui = UI[route.lang]
  const spyPausedUntil = useRef(0)

  useEffect(() => {
    document.documentElement.lang = route.lang
    const name = dojo.name[route.lang]
    document.title = route.section ? `${SECTIONS[route.section].label[route.lang]} · ${name}` : name
  }, [route])

  // Menu links / Back / Forward → scroll
  useEffect(
    () =>
      onScrollRequest((r, smooth) => {
        spyPausedUntil.current = performance.now() + 1200
        scrollToSection(r.section, smooth)
      }),
    [],
  )

  // Opened on a section address (shared link, reload) → start there, and stay aligned
  // while fonts and content above finish loading (unless the visitor starts scrolling).
  useLayoutEffect(() => {
    const r = getRoute()
    if (!r.section) return
    let userMoved = false
    const stop = () => (userMoved = true)
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))
    const align = () => {
      if (userMoved || getRoute().section !== r.section) return
      spyPausedUntil.current = performance.now() + 600
      scrollToSection(r.section, false, false)
    }
    requestAnimationFrame(align)
    document.fonts?.ready.then(align)
    const timers = [250, 700, 1500].map((ms) => setTimeout(align, ms))
    return () => {
      timers.forEach(clearTimeout)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [])

  // The address follows the section in view
  useEffect(() => {
    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting))
        if (performance.now() < spyPausedUntil.current) return
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
        const inView = atBottom ? SECTION_IDS[SECTION_IDS.length - 1] : SECTION_IDS.find((id) => visible.get(id))
        const lang = getRoute().lang
        if (visible.get('top') || window.scrollY < 40) syncRoute({ lang, section: null })
        else if (inView) syncRoute({ lang, section: inView })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', ...SECTION_IDS].forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero lang={route.lang} />
        {SECTION_IDS.map((id) => {
          const Content = CONTENT[id]
          const meta = SECTIONS[id]
          return (
            <section key={id} id={id} className={`section section--${id}`} aria-labelledby={`${id}-title`}>
              {id === 'schedule' && (
                <div className="section__band">
                  <Picture image={sectionImages.classes} lang={route.lang} sizes="100vw" className="section__band-img" />
                </div>
              )}
              <div className="section__inner">
                <div className="section__head">
                  <p className="section__kanji" lang="ja" aria-hidden="true">
                    {meta.kanji}
                  </p>
                  <h2 id={`${id}-title`} tabIndex={-1}>
                    {meta.label[route.lang]}
                  </h2>
                </div>
                <div className="section__body">
                  {id === 'about' ? (
                    <div className="split">
                      <div>
                        <Content lang={route.lang} />
                      </div>
                      <Picture image={sectionImages.about} lang={route.lang} sizes="(min-width: 960px) 40vw, 100vw" className="split__img" />
                    </div>
                  ) : (
                    <Content lang={route.lang} />
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <div>
            <p className="footer__kanji" lang="ja" aria-hidden="true">
              {dojo.calligraphy}
            </p>
            <p className="footer__name">{dojo.name[route.lang]}</p>
            <p className="footer__tag">{dojo.tagline[route.lang]}</p>
          </div>
          <nav aria-label={ui.sections}>
            <ul className="footer__nav">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={routeToPath({ lang: route.lang, section: id })}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate({ lang: route.lang, section: id })
                    }}
                  >
                    {SECTIONS[id].label[route.lang]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer__meta">
            {LANGS.filter((l) => l !== route.lang).map((l) => (
              <a key={l} href={routeToPath({ lang: l, section: null })} hrefLang={l} lang={l} onClick={(e) => { e.preventDefault(); navigate({ lang: l, section: null }) }}>
                {UI[route.lang].switchTo}
              </a>
            ))}
            <a href="#top" onClick={(e) => { e.preventDefault(); navigate({ lang: route.lang, section: null }) }}>
              {ui.backToTop} ↑
            </a>
            <p className="footer__note">{ui.footerNote}</p>
          </div>
        </div>
      </footer>
    </>
  )
}
