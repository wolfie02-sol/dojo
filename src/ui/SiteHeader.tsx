/** Top navigation: transparent over the opening image, solid once you scroll. Menu drawer on small screens. */
import { useEffect, useRef, useState } from 'react'
import { dojo } from '../config/content'
import { LANGS, SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'
import { UI } from '../i18n/ui'
import { linkClick, routeToPath, useRoute } from '../router/router'
import { IconClose, IconMenu } from './Icons'

const other = (lang: Lang): Lang => LANGS.find((l) => l !== lang) ?? lang

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return scrolled
}

export function SiteHeader() {
  const route = useRoute()
  const ui = UI[route.lang]
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, section: SectionId | null, lang: Lang = route.lang) =>
    linkClick(e, { lang, section }, () => setOpen(false))

  const links = (inDrawer: boolean) =>
    SECTION_IDS.map((id) => (
      <li key={id}>
        <a href={routeToPath({ lang: route.lang, section: id })} aria-current={route.section === id ? 'page' : undefined} onClick={(e) => go(e, id)}>
          {inDrawer && (
            <span className="drawer__kanji" lang="ja" aria-hidden="true">
              {SECTIONS[id].kanji}
            </span>
          )}
          <span>{SECTIONS[id].label[route.lang]}</span>
        </a>
      </li>
    ))

  return (
    <header className={`site-header${scrolled ? ' is-solid' : ''}`}>
      <a className="skip-link" href="#main">
        {ui.skipToContent}
      </a>
      <div className="site-header__bar">
        <a className="brand" href={routeToPath({ lang: route.lang, section: null })} onClick={(e) => go(e, null)}>
          <img className="brand__logo" src={`${import.meta.env.BASE_URL}${dojo.logo.mark.slice(1)}`} alt="" width={40} height={40} />
          <span className="brand__name">{dojo.name[route.lang]}</span>
        </a>
        <nav className="nav" aria-label={ui.sections}>
          <ul>{links(false)}</ul>
        </nav>
        <div className="site-header__actions">
          <a
            className="lang"
            href={routeToPath({ lang: other(route.lang), section: route.section })}
            hrefLang={other(route.lang)}
            lang={other(route.lang)}
            aria-label={ui.switchToLabel}
            onClick={(e) => go(e, route.section, other(route.lang))}
          >
            {other(route.lang).toUpperCase()}
          </a>
          <button type="button" className="menu-btn" aria-haspopup="dialog" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
            <IconMenu />
            <span className="sr-only">{ui.menu}</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        id="menu"
        className="drawer"
        aria-label={ui.menu}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false)
        }}
      >
        <div className="drawer__inner">
          <div className="drawer__head">
            <p className="drawer__title">{dojo.name[route.lang]}</p>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={ui.closeMenu}>
              <IconClose />
            </button>
          </div>
          <nav aria-label={ui.sections}>
            <ul className="drawer__list">{links(true)}</ul>
          </nav>
          <a className="btn btn--outline drawer__lang" href={routeToPath({ lang: other(route.lang), section: route.section })} hrefLang={other(route.lang)} lang={other(route.lang)} onClick={(e) => go(e, route.section, other(route.lang))}>
            {ui.switchTo}
          </a>
        </div>
      </dialog>
    </header>
  )
}
