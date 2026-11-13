/**
 * Full-screen opening: a real photo (or video) of the dojo with a slow, steady
 * "walking in" zoom, then the dojo's name. Scrolling continues the move gently.
 * Reduced motion: no zoom, no scroll effect, video not autoplayed.
 */
import { useEffect, useRef, useState } from 'react'
import { cta, dojo } from '../config/content'
import { hero } from '../config/media'
import type { Lang } from '../config/site'
import { UI } from '../i18n/ui'
import { navigate, routeToPath } from '../router/router'
import { Picture } from './Picture'

const asset = (p: string) => (p.startsWith('/') ? `${import.meta.env.BASE_URL}${p.slice(1)}` : p)

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export function Hero({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const reduced = useReducedMotion()
  const scrollLayer = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(!reduced)

  // Scrolling past the hero continues the move into the room (transform only, one rAF per frame)
  useEffect(() => {
    const el = scrollLayer.current
    if (!el || reduced || hero.zoom.scrollScale <= 0) return
    let frame = 0
    const update = () => {
      frame = 0
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      el.style.transform = `scale(${1 + p * hero.zoom.scrollScale})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

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
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden={hero.video ? true : undefined}>
        <div className="hero__scroll" ref={scrollLayer} style={{ transformOrigin: hero.zoom.origin }}>
          <div className={`hero__zoom${reduced ? '' : ' is-moving'}`} style={zoomStyle}>
            {hero.video && !reduced ? (
              <video ref={video} className="hero__img" autoPlay muted loop playsInline preload="auto" poster={poster}>
                {hero.video.mp4Mobile && <source src={asset(hero.video.mp4Mobile)} type="video/mp4" media="(max-width: 800px)" />}
                <source src={asset(hero.video.mp4)} type="video/mp4" />
              </video>
            ) : (
              <Picture image={hero.image} lang={lang} sizes="100vw" className="hero__img" eager />
            )}
          </div>
        </div>
        <div className="hero__shade" />
      </div>

      <div className="hero__content">
        <p className="hero__kanji" lang="ja" aria-hidden="true">
          {dojo.calligraphy}
        </p>
        <h1 className="hero__title" id="hero-title">{dojo.name[lang]}</h1>
        <p className="hero__tagline">{dojo.tagline[lang]}</p>
        <div className="hero__actions">
          <a
            className="btn btn--light"
            href={routeToPath({ lang, section: 'about' })}
            onClick={(e) => {
              e.preventDefault()
              navigate({ lang, section: 'about' })
            }}
          >
            {cta.discover[lang]}
          </a>
          <a
            className="btn btn--outline-light"
            href={routeToPath({ lang, section: 'schedule' })}
            onClick={(e) => {
              e.preventDefault()
              navigate({ lang, section: 'schedule' })
            }}
          >
            {cta.schedule[lang]}
          </a>
        </div>
      </div>

      {hero.video && !reduced && (
        <button type="button" className="hero__pause" onClick={() => setPlaying((p) => !p)} aria-label={playing ? ui.pauseVideo : ui.playVideo}>
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

      <a
        className="hero__cue"
        href={routeToPath({ lang, section: 'about' })}
        aria-label={ui.scrollDown}
        onClick={(e) => {
          e.preventDefault()
          navigate({ lang, section: 'about' })
        }}
      >
        <span aria-hidden="true" />
      </a>
    </section>
  )
}
