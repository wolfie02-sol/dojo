import { lazy, Suspense, useEffect, useMemo } from 'react'
import { dojo } from './config/content'
import { timings } from './config/experience'
import { SECTIONS } from './config/site'
import { UI } from './i18n/ui'
import { webglAvailable } from './lib/device'
import { useRoute } from './router/router'
import { ExperienceProvider, useExperience } from './state/ExperienceContext'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { FallbackDojo } from './ui/FallbackDojo'
import { InteriorHint, IntroOverlay, LoadingScreen, TopBar, Veil } from './ui/Chrome'
import { SectionPanel } from './ui/SectionPanel'

// three.js + the scene live in a separate chunk, loaded after the HTML shell is on screen
const DojoCanvas = lazy(() => import('./scene/DojoCanvas'))

export function App() {
  const webgl = useMemo(webglAvailable, [])
  return (
    <ExperienceProvider mode={webgl ? 'scene' : 'fallback'} fallbackReason={webgl ? null : 'no-webgl'}>
      <Shell />
    </ExperienceProvider>
  )
}

function SceneHost() {
  const { dispatch } = useExperience()
  return (
    <div className="scene">
      <ErrorBoundary onError={(e) => dispatch({ type: 'SCENE_FAILED', reason: String(e) })}>
        <Suspense fallback={null}>
          <DojoCanvas />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function Shell() {
  const { state, dispatch } = useExperience()
  const route = useRoute()
  const ui = UI[route.lang]

  // <title> and <html lang> follow the route
  useEffect(() => {
    document.documentElement.lang = route.lang
    const name = dojo.name[route.lang]
    document.title = route.section ? `${SECTIONS[route.section].label[route.lang]} · ${name}` : name
  }, [route])

  // A section requested while outside (menu, link, Back button) → go straight in
  useEffect(() => {
    if (route.section && (state.phase === 'exterior' || state.phase === 'entering')) dispatch({ type: 'SKIP' })
  }, [route.section, state.phase, dispatch])

  // "Replay entrance": once back outside, start the glide after a short pause
  useEffect(() => {
    if (state.phase !== 'exterior' || !state.autoEnter) return
    const t = setTimeout(() => dispatch({ type: 'ENTER' }), timings.replayDelay * 1000)
    return () => clearTimeout(t)
  }, [state.phase, state.autoEnter, dispatch])

  const scene = state.mode === 'scene'
  const panelOpen = route.section !== null && (!scene || state.phase === 'interior')

  return (
    <div className={`app${panelOpen ? ' has-panel' : ''}`} data-phase={state.phase} data-mode={state.mode}>
      <a className="skip-link" href="#main">
        {ui.skipToContent}
      </a>
      <TopBar />
      <main id="main" className="stage" tabIndex={-1}>
        {scene ? <SceneHost /> : <FallbackDojo />}
        {scene && <IntroOverlay />}
        {scene && <InteriorHint />}
      </main>
      <SectionPanel open={panelOpen} section={route.section} lang={route.lang} />
      {scene && <LoadingScreen />}
      <Veil />
    </div>
  )
}
