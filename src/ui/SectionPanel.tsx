/**
 * The content panel: side sheet on desktop, bottom sheet on phones.
 * Focus moves to the heading when it opens and returns to whatever opened it on close.
 * Escape, the × button and "Back to the dojo" all close it (the URL goes back to /<lang>/).
 */
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { SECTIONS, type Lang, type SectionId } from '../config/site'
import { UI } from '../i18n/ui'
import { closeSection } from '../router/router'
import { setPendingHotspotFocus, takeTrigger } from '../state/hover'
import { IconArrowLeft, IconClose } from './Icons'
import { AboutSection, BlackBeltsSection, ContactSection, LinksSection, ScheduleSection, SenseiSection } from './sections/Sections'
import { CalendarSection } from './sections/CalendarSection'

const CONTENT: Record<SectionId, ComponentType<{ lang: Lang }>> = {
  about: AboutSection,
  sensei: SenseiSection,
  schedule: ScheduleSection,
  calendar: CalendarSection,
  blackBelts: BlackBeltsSection,
  links: LinksSection,
  contact: ContactSection,
}

export function SectionPanel({ open, section, lang }: { open: boolean; section: SectionId | null; lang: Lang }) {
  const ui = UI[lang]
  const heading = useRef<HTMLHeadingElement>(null)
  const body = useRef<HTMLDivElement>(null)
  // keep the last section rendered while the panel slides out
  const [shown, setShown] = useState<SectionId | null>(section)
  useEffect(() => {
    if (section) setShown(section)
  }, [section])

  // focus management
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) {
      body.current?.scrollTo({ top: 0 })
      // let the panel become visible first so the focus ring and scroll position are right
      const t = setTimeout(() => heading.current?.focus({ preventScroll: true }), 60)
      wasOpen.current = true
      return () => clearTimeout(t)
    }
    if (wasOpen.current) {
      wasOpen.current = false
      const back = takeTrigger() ?? document.querySelector<HTMLElement>(`[data-section="${shown}"]`)
      const main = document.getElementById('main')
      if (back?.closest('.hotspots')) {
        // the hotspot is inert until the camera has glided back: park focus, hand over when it settles
        main?.focus({ preventScroll: true })
        setPendingHotspotFocus(back)
        return
      }
      const t = setTimeout(() => (back ?? main)?.focus({ preventScroll: true }), 60)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) closeSection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const meta = shown ? SECTIONS[shown] : null
  const Content = shown ? CONTENT[shown] : null

  return (
    <aside className={`panel${open ? ' is-open' : ''}`} aria-labelledby="panel-title" aria-hidden={!open} inert={!open}>
      {meta && Content && (
        <div className="panel__sheet">
          <header className="panel__head">
            <p className="panel__kanji" lang="ja" aria-hidden="true">
              {meta.kanji}
            </p>
            <h2 id="panel-title" ref={heading} tabIndex={-1}>
              {meta.label[lang]}
            </h2>
            <button type="button" className="icon-btn panel__close" onClick={closeSection} aria-label={ui.close}>
              <IconClose />
            </button>
          </header>
          <div className="panel__body" ref={body}>
            <Content lang={lang} />
          </div>
          <footer className="panel__foot">
            <button type="button" className="btn-text" onClick={closeSection}>
              <IconArrowLeft /> {ui.backToDojo}
            </button>
          </footer>
        </div>
      )}
    </aside>
  )
}
