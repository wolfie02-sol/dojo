/**
 * Home page: a slowly drifting photo collage (Japan + Montreal), the dojo's name,
 * and the menu of sections on top.
 * Rows scroll in alternating directions. A pause button stops the movement, and
 * visitors who prefer reduced motion get a still collage.
 */
import { useEffect, useState } from 'react'
import { dojo } from '../config/content'
import { collage, type CollagePhoto } from '../config/media'
import { SECTIONS, SECTION_IDS, type Lang } from '../config/site'
import { UI } from '../i18n/ui'
import { linkClick, routeToPath } from '../router/router'

const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

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

/** Each row shows 8 photos taken from the list at a different starting point. */
function rowPhotos(row: number): CollagePhoto[] {
  const list = collage.photos
  const perRow = Math.min(8, list.length)
  const start = (row * 5) % list.length
  return Array.from({ length: perRow }, (_, i) => list[(start + i) % list.length])
}

function Tile({ photo, eager }: { photo: CollagePhoto; eager: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="collage__tile collage__tile--missing" />
  return (
    <picture className="collage__tile">
      <source type="image/webp" srcSet={asset(`/images/collage/${photo.file}.webp`)} />
      <img src={asset(`/images/collage/${photo.file}.jpg`)} alt="" width={720} height={480} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
    </picture>
  )
}

function Collage({ lang, moving }: { lang: Lang; moving: boolean }) {
  const rows = Array.from({ length: collage.rows }, (_, r) => r)
  return (
    <div className={`collage${moving ? ' is-moving' : ''}`} role="img" aria-label={UI[lang].collageLabel} style={{ '--rows': collage.rows } as React.CSSProperties}>
      <div className="collage__wall">
        {rows.map((r) => {
          const photos = rowPhotos(r)
          return (
            <div
              key={r}
              className={`collage__row${r % 2 ? ' collage__row--reverse' : ''}`}
              style={{ '--duration': `${collage.secondsPerLoop * (1 + (r % 3) * 0.14)}s` } as React.CSSProperties}
            >
              {/* the set is drawn twice so the loop is seamless */}
              <div className="collage__track">
                {[...photos, ...photos].map((p, i) => (
                  <Tile key={i} photo={p} eager={r < 3 && i < 6} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Home({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const moving = !reduced && !paused

  return (
    <div className="home">
      <div className="home__media">
        <Collage lang={lang} moving={moving} />
        <div className="home__shade" />
      </div>

      <div className="home__content">
        <div className="home__intro">
          <h1 className="home__title" tabIndex={-1}>
            <img className="home__logo" src={asset(dojo.logo.badge)} alt={`${dojo.name[lang]} — ${dojo.kanjiName}`} width={894} height={1185} />
          </h1>
          <p className="home__tagline">{dojo.tagline[lang]}</p>
        </div>

        <nav className="home__menu" aria-label={ui.sections}>
          <ul>
            {SECTION_IDS.map((id, i) => (
              <li key={id} style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
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

      {!reduced && (
        <button type="button" className="home__pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused} aria-label={paused ? ui.playAnimation : ui.pauseAnimation}>
          {paused ? (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
