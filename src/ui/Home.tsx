/**
 * Home page: full-screen photo (or video) of the dojo with a slow "walking in" zoom,
 * the dojo's name, and the menu of sections laid over the image.
 * Reduced motion: no zoom, video not autoplayed.
 */
import { useEffect, useRef, useState } from 'react'
import { dojo } from '../config/content'
import { hero } from '../config/media'
import { SECTIONS, SECTION_IDS, type Lang } from '../config/site'
import { UI } from '../i18n/ui'
import { linkClick, routeToPath } from '../router/router'
import { Picture } from './Picture'

const asset = (p: string) => (p.startsWith('/') ? `${import.meta.env.BASE_URL}${p.slice(1)}` : p)

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export function Home({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const reduced = useReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(!reduced)

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) v.play().catch(() => setPlaying(false))
    else v.pause()
  }, [playing])

  const zoomStyle = {
    '--zoom-scale': hero.zoom.scale,
    '--zoom-duration': `${hero.zoom.duration}s`,
    transformOrigin: hero.zoom.origin,
  } as React.CSSProperties
  const poster = asset(`${hero.image.base}-${hero.image.widths[hero.image.widths.length - 1]}.jpg`)

  return (
    <div className="home">
      <div className="home__media" aria-hidden={hero.video ? true : undefined}>
        <div className={`home__zoom${reduced ? '' : ' is-moving'}`} style={zoomStyle}>
          {hero.video && !reduced ? (
            <video ref={video} className="home__img" autoPlay muted loop playsInline preload="auto" poster={poster}>
              {hero.video.mp4Mobile && <source src={asset(hero.video.mp4Mobile)} type="video/mp4" media="(max-width: 800px)" />}
              <source src={asset(hero.video.mp4)} type="video/mp4" />
            </video>
          ) : (
            <Picture image={hero.image} lang={lang} sizes="100vw" className="home__img" eager />
          )}
        </div>
        <div className="home__shade" />
      </div>

      <div className="home__content">
        <div className="home__intro">
          <p className="home__kanji" lang="ja" aria-hidden="true">
            {dojo.calligraphy}
          </p>
          <h1 className="home__title" tabIndex={-1}>{dojo.name[lang]}</h1>
          <p className="home__tagline">{dojo.tagline[lang]}</p>
        </div>

        <nav className="home__menu" aria-label={ui.sections}>
          <ul>
            {SECTION_IDS.map((id, i) => (
              <li key={id} style={{ animationDelay: `${1.9 + i * 0.08}s` }}>
                <a href={routeToPath({ lang, section: id })} onClick={(e) => linkClick(e, { lang, section: id })}>
                  <span className="home__menu-kanji" lang="ja" aria-hidden="true">
                    {SECTIONS[id].kanji}
                  </span>
                  <span className="home__menu-label">{SECTIONS[id].label[lang]}</span>
                  <span className="home__menu-hint">{SECTIONS[id].hint[lang]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {hero.video && !reduced && (
        <button type="button" className="home__pause" onClick={() => setPlaying((p) => !p)} aria-label={playing ? ui.pauseVideo : ui.playVideo}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
