/**
 * HTML version of the dojo, used when WebGL is unavailable, the scene fails, or the
 * visitor chooses "Simple version". Every section stays reachable.
 */
import { dojo } from '../config/content'
import { SECTIONS, SECTION_IDS } from '../config/site'
import { UI } from '../i18n/ui'
import { navigate, routeToPath, useRoute } from '../router/router'
import { useExperience } from '../state/ExperienceContext'
import { rememberTrigger } from '../state/hover'

function DojoIllustration() {
  return (
    <svg className="fallback__art" viewBox="0 0 800 420" role="presentation" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe6ea" />
          <stop offset="0.7" stopColor="#f6e9df" />
        </linearGradient>
      </defs>
      <rect width="800" height="420" fill="url(#fb-sky)" />
      <ellipse cx="160" cy="430" rx="320" ry="120" fill="#c9cbb6" />
      <ellipse cx="660" cy="440" rx="320" ry="130" fill="#d4d5c4" />
      {/* dojo */}
      <polygon points="250,190 400,95 550,190" fill="#3b3936" />
      <polygon points="282,190 400,118 518,190" fill="#e8dcc6" />
      <rect x="290" y="190" width="220" height="150" fill="#e8dcc6" />
      <rect x="290" y="190" width="220" height="10" fill="#5a3a26" />
      <rect x="368" y="232" width="64" height="108" fill="#9a6a43" />
      <rect x="398" y="232" width="4" height="108" fill="#5a3a26" />
      <rect x="378" y="208" width="44" height="16" fill="#5a3a26" />
      <rect x="270" y="340" width="260" height="14" fill="#c79a6b" />
      <rect x="0" y="352" width="800" height="70" fill="#93a06a" />
      <polygon points="372,352 428,352 470,420 330,420" fill="#d9d1c2" />
      {/* cherry trees */}
      {[
        [140, 230, 1.1],
        [660, 240, 1.2],
        [70, 290, 0.8],
        [740, 300, 0.8],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 120 C 4 70, -6 40, 0 0" stroke="#4b362a" strokeWidth="9" fill="none" />
          <path d="M0 40 C 20 20, 40 10, 60 -5 M0 30 C -20 15, -40 5, -55 -10" stroke="#4b362a" strokeWidth="5" fill="none" />
          {[
            [0, -20, 48],
            [45, -15, 38],
            [-45, -15, 38],
            [20, -50, 34],
            [-22, -48, 32],
            [70, 5, 26],
            [-70, 2, 26],
          ].map(([cx, cy, r], j) => (
            <circle key={j} cx={cx} cy={cy} r={r} fill={j % 2 ? '#f2bfcc' : '#f7d3dc'} opacity="0.95" />
          ))}
        </g>
      ))}
    </svg>
  )
}

export function FallbackDojo() {
  const route = useRoute()
  const { state, dispatch } = useExperience()
  const ui = UI[route.lang]
  const canRetry = state.fallbackReason !== 'no-webgl'
  return (
    <div className="fallback">
      <div className="fallback__hero">
        <DojoIllustration />
        <div className="fallback__intro">
          <p className="intro__kanji" lang="ja" aria-hidden="true">
            {dojo.calligraphy}
          </p>
          <h1 className="intro__title">{dojo.name[route.lang]}</h1>
          <p className="intro__tagline">{dojo.tagline[route.lang]}</p>
        </div>
      </div>
      <nav className="fallback__nav" aria-label={ui.sections}>
        <ul className="fallback__grid">
          {SECTION_IDS.map((id) => (
            <li key={id}>
              <a
                className="tile"
                href={routeToPath({ lang: route.lang, section: id })}
                data-section={id}
                aria-current={route.section === id ? 'page' : undefined}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  rememberTrigger(e.currentTarget)
                  navigate({ lang: route.lang, section: id })
                }}
              >
                <span className="tile__kanji" lang="ja" aria-hidden="true">
                  {SECTIONS[id].kanji}
                </span>
                <span className="tile__label">{SECTIONS[id].label[route.lang]}</span>
                <span className="tile__hint">{SECTIONS[id].hint[route.lang]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {state.fallbackReason && state.fallbackReason !== 'user-choice' && (
        <p className="fallback__notice">
          {ui.fallbackNotice}{' '}
          {canRetry && (
            <button type="button" className="btn-text" onClick={() => dispatch({ type: 'RETRY_SCENE' })}>
              {ui.retry3d}
            </button>
          )}
        </p>
      )}
      {state.fallbackReason === 'user-choice' && (
        <p className="fallback__notice">
          <button type="button" className="btn-text" onClick={() => dispatch({ type: 'RETRY_SCENE' })}>
            {ui.retry3d}
          </button>
        </p>
      )}
    </div>
  )
}
