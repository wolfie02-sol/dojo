import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { initialState, reducer, type ExperienceEvent, type ExperienceState, type Mode } from './machine'
import { loadMotionPref, saveMotionPref, systemPrefersReducedMotion } from '../lib/prefs'

interface Ctx {
  state: ExperienceState
  dispatch: (e: ExperienceEvent) => void
  reducedMotion: boolean
}

const ExperienceContext = createContext<Ctx | null>(null)

export function ExperienceProvider({ mode, fallbackReason, children }: { mode: Mode; fallbackReason: string | null; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(loadMotionPref(), mode, fallbackReason))

  // Persist the visitor's motion choice
  useEffect(() => saveMotionPref(state.motion), [state.motion])

  // Follow OS changes live (only matters if the visitor never chose explicitly)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => dispatch({ type: 'SET_MOTION', value: systemPrefersReducedMotion() ? 'reduced' : 'full' })
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.motion = state.motion
  }, [state.motion])

  const value = useMemo(() => ({ state, dispatch, reducedMotion: state.motion === 'reduced' }), [state])
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
}

export function useExperience(): Ctx {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be used inside ExperienceProvider')
  return ctx
}
