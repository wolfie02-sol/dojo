/**
 * Interface layers over the scene: top bar + menu drawer, entrance controls,
 * interior hint, loading screen and the transition veil.
 */
import { useEffect, useRef, useState } from 'react'
import { cta, dojo } from '../config/content'
import { timings } from '../config/experience'
import { LANGS, SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'
import { UI } from '../i18n/ui'
import { hasSeenIntro } from '../lib/prefs'
import { navigate, routeToPath, useRoute } from '../router/router'
import { useExperience } from '../state/ExperienceContext'
import { rememberTrigger } from '../state/hover'
import { IconClose, IconHome, IconMenu, IconMotion, IconReplay } from './Icons'

const otherLang = (lang: Lang): Lang => LANGS.find((l) => l !== lang) ?? lang

/** Same-page link that uses the router (keeps real hrefs for new-tab / copy link) */
function useNavClick() {
  return (e: React.MouseEvent<HTMLAnchorElement>, to: { lang: Lang; section: SectionId | null }) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
}

function MotionToggle({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useExperience()
  const { lang } = useRoute()
  const ui = UI[lang]
  const reduced = state.motion === 'reduced'
  return (
    <button
      type="button"
      className={`pill${compact ? ' pill--icon-sm' : ''}`}
      aria-pressed={reduced}
      aria-label={compact ? ui.motionToggle : undefined}
      title={ui.motionToggle}
      onClick={() => dispatch({ type: 'SET_MOTION', value: reduced ? 'full' : 'reduced' })}
    >
      <IconMotion reduced={reduced} />
      <span className={compact ? 'sr-only' : 'pill__text'}>{reduced ? ui.motionReduced : ui.motionFull}</span>
    </button>
  )
}

export function TopBar() {
  const route = useRoute()
  const { state } = useExperience()
  const ui = UI[route.lang]
  const other = otherLang(route.lang)
  const onNav = useNavClick()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)

  return (
    <>
      <header className="topbar">
        <a className="brand" href={routeToPath({ lang: route.lang, section: null })} onClick={(e) => onNav(e, { lang: route.lang, section: null })}>
          <span className="brand__mark" lang="ja" aria-hidden="true">
            空手道
          </span>
          <span className="brand__name">{dojo.name[route.lang]}</span>
        </a>
        <div className="topbar__actions">
          <a
            className="pill pill--lang"
            href={routeToPath({ lang: other, section: route.section })}
            hrefLang={other}
            lang={other}
            aria-label={ui.switchToLabel}
            onClick={(e) => onNav(e, { lang: other, section: route.section })}
          >
            {other.toUpperCase()}
          </a>
          {state.mode === 'scene' && <MotionToggle compact />}
          <button ref={menuBtn} type="button" className="pill pill--menu" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="nav-drawer" onClick={() => setMenuOpen(true)}>
            <IconMenu />
            <span className="pill__text">{ui.menu}</span>
          </button>
        </div>
      </header>
      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuBtn} />
    </>
  )
}

function NavDrawer({ open, onClose, returnFocusTo }: { open: boolean; onClose: () => void; returnFocusTo: React.RefObject<HTMLButtonElement | null> }) {
  const ref = useRef<HTMLDialogElement>(null)
  const route = useRoute()
  const { state, dispatch } = useExperience()
  const ui = UI[route.lang]
  const other = otherLang(route.lang)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, section: SectionId | null, lang: Lang = route.lang) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    rememberTrigger(returnFocusTo.current)
    onClose()
    navigate({ lang, section })
  }

  return (
    <dialog
      ref={ref}
      id="nav-drawer"
      className="drawer"
      aria-label={ui.menu}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose() // click on the backdrop
      }}
    >
      <div className="drawer__inner">
        <div className="drawer__head">
          <p className="drawer__title">{dojo.name[route.lang]}</p>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={ui.closeMenu}>
            <IconClose />
          </button>
        </div>
        <nav aria-label={ui.sections}>
          <ul className="drawer__list">
            <li>
              <a href={routeToPath({ lang: route.lang, section: null })} aria-current={route.section === null ? 'page' : undefined} onClick={(e) => go(e, null)}>
                <span className="drawer__kanji" aria-hidden="true">
                  <IconHome />
                </span>
                <span>{ui.dojoView}</span>
              </a>
            </li>
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={routeToPath({ lang: route.lang, section: id })} aria-current={route.section === id ? 'page' : undefined} onClick={(e) => go(e, id)}>
                  <span className="drawer__kanji" lang="ja" aria-hidden="true">
                    {SECTIONS[id].kanji}
                  </span>
                  <span>
                    {SECTIONS[id].label[route.lang]}
                    <small>{SECTIONS[id].hint[route.lang]}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="drawer__foot">
          {state.mode === 'scene' && (
            <button
              type="button"
              className="pill"
              disabled={state.phase !== 'interior'}
              onClick={() => {
                onClose()
                navigate({ lang: route.lang, section: null }, { replace: true })
                dispatch({ type: 'REPLAY' })
              }}
            >
              <IconReplay />
              <span className="pill__text">{ui.replay}</span>
            </button>
          )}
          {state.mode === 'scene' && <MotionToggle />}
          <a className="pill" href={routeToPath({ lang: other, section: route.section })} hrefLang={other} lang={other} onClick={(e) => go(e, route.section, other)}>
            <span className="pill__text">{ui.switchTo}</span>
          </a>
        </div>
      </div>
    </dialog>
  )
}

export function IntroOverlay() {
  const { state, dispatch } = useExperience()
  const { lang } = useRoute()
  const ui = UI[lang]
  const [returning] = useState(hasSeenIntro)
  const outside = state.phase === 'exterior' && !state.autoEnter
  const entering = state.phase === 'entering'

  return (
    <>
      <div className={`intro${outside ? ' is-visible' : ''}`} inert={!outside} aria-hidden={!outside}>
        <p className="intro__kanji" lang="ja" aria-hidden="true">
          {dojo.calligraphy}
        </p>
        <h1 className="intro__title">{dojo.name[lang]}</h1>
        <p className="intro__tagline">{returning ? ui.welcomeBack : dojo.tagline[lang]}</p>
        <div className="intro__actions">
          {returning ? (
            <>
              <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: 'SKIP' })}>
                {cta.enterDirect[lang]}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'ENTER' })}>
                {cta.replay[lang]}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: 'ENTER' })}>
                {cta.enter[lang]}
              </button>
              <button type="button" className="btn-text" onClick={() => dispatch({ type: 'SKIP' })}>
                {cta.skip[lang]}
              </button>
            </>
          )}
        </div>
      </div>
      {/* Skip stays available during the glide */}
      <button type="button" className={`skip-float${entering ? ' is-visible' : ''}`} inert={!entering} aria-hidden={!entering} onClick={() => dispatch({ type: 'SKIP' })}>
        {cta.skip[lang]}
      </button>
    </>
  )
}

export function InteriorHint() {
  const { state } = useExperience()
  const route = useRoute()
  const ui = UI[route.lang]
  const show = state.phase === 'interior' && state.settled && route.section === null
  return (
    <p className={`hint${show ? ' is-visible' : ''}`} aria-hidden={!show}>
      <span>{ui.chooseObject}</span>
      <span className="hint__swipe">{ui.lookAround}</span>
    </p>
  )
}

export function LoadingScreen() {
  const { state, dispatch } = useExperience()
  const { lang } = useRoute()
  const ui = UI[lang]
  const loading = state.phase === 'loading'
  const [slow, setSlow] = useState(false)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setGone(true), 900)
      return () => clearTimeout(t)
    }
    setGone(false)
    const t = setTimeout(() => setSlow(true), 9000)
    return () => clearTimeout(t)
  }, [loading])
  if (gone) return null
  return (
    <div className={`loading${loading ? '' : ' is-done'}`} role="status" aria-live="polite">
      <p className="loading__kanji" lang="ja" aria-hidden="true">
        {dojo.calligraphy}
      </p>
      <p className="loading__name">{dojo.name[lang]}</p>
      <div className="loading__bar" aria-hidden="true">
        <span />
      </div>
      <p className="loading__text">{ui.loading}</p>
      {slow && loading && (
        <p className="loading__slow">
          {ui.loadingSlow}{' '}
          <button type="button" className="btn-text" onClick={() => dispatch({ type: 'SCENE_FAILED', reason: 'user-choice' })}>
            {ui.useSimple}
          </button>
        </p>
      )}
    </div>
  )
}

/** Cream veil used for skip / direct entry / replay cuts. The camera only cuts while it is fully opaque. */
export function Veil() {
  const { state, dispatch, reducedMotion } = useExperience()
  const [opaque, setOpaque] = useState(false)
  const fadeIn = reducedMotion ? timings.veilInReduced : timings.veilIn
  const fadeOut = reducedMotion ? timings.veilOutReduced : timings.veilOut

  useEffect(() => {
    if (state.phase !== 'transition') return
    setOpaque(true)
    const t = setTimeout(() => dispatch({ type: 'CUT_DONE' }), fadeIn * 1000 + 40)
    return () => clearTimeout(t)
  }, [state.phase, dispatch, fadeIn])

  useEffect(() => {
    if (state.phase === 'transition' || !opaque) return
    // wait two frames so the camera cut has rendered before revealing
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOpaque(false))
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [state.phase, opaque])

  return <div className={`veil${opaque ? ' is-opaque' : ''}`} style={{ transitionDuration: `${opaque ? fadeIn : fadeOut}s` }} aria-hidden="true" />
}
