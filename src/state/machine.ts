/**
 * Experience state machine.
 *
 *   loading ──SCENE_READY──▶ exterior ──ENTER──▶ entering ──ENTRANCE_DONE──▶ interior
 *      │                        │  ▲                 │                          │
 *      │ (deep link /            │  │ CUT_DONE        │ SKIP / deep link         │ REPLAY
 *      │  return visit)          ▼  │                 ▼                          ▼
 *      └──────────────▶ interior ◀─CUT_DONE── transition (veil fade, camera cut) ◀┘
 *
 * The open section is NOT stored here: it comes from the URL (see router.ts).
 * "Section open" = phase 'interior' + a section in the route.
 * `settled` is true once the camera has fully stopped; hotspots only accept
 * input while settled, so overlapping animations can't be started.
 */
import type { MotionPref } from '../lib/prefs'

export type Phase = 'loading' | 'exterior' | 'entering' | 'transition' | 'interior'
export type Mode = 'scene' | 'fallback'

export interface ExperienceState {
  mode: Mode
  phase: Phase
  settled: boolean
  /** Where the veil transition is heading */
  cutTarget: 'interior' | 'exterior' | null
  /** Incremented on each entrance so stale completions are ignored */
  run: number
  /** Start the entrance automatically once outside (used by "Replay entrance") */
  autoEnter: boolean
  motion: MotionPref
  fallbackReason: string | null
}

export type ExperienceEvent =
  | { type: 'SCENE_READY'; direct: boolean }
  | { type: 'SCENE_FAILED'; reason: string }
  | { type: 'RETRY_SCENE' }
  | { type: 'ENTER' }
  | { type: 'SKIP' }
  | { type: 'ENTRANCE_DONE'; run: number }
  | { type: 'CUT_DONE' }
  | { type: 'REPLAY' }
  | { type: 'CAMERA_MOVING' }
  | { type: 'CAMERA_SETTLED' }
  | { type: 'SET_MOTION'; value: MotionPref }

export function initialState(motion: MotionPref, mode: Mode, fallbackReason: string | null = null): ExperienceState {
  return {
    mode,
    phase: mode === 'fallback' ? 'interior' : 'loading',
    settled: mode === 'fallback',
    cutTarget: null,
    run: 0,
    autoEnter: false,
    motion,
    fallbackReason,
  }
}

export function reducer(state: ExperienceState, event: ExperienceEvent): ExperienceState {
  switch (event.type) {
    case 'SCENE_READY':
      if (state.phase !== 'loading') return state
      return event.direct
        ? { ...state, phase: 'interior', settled: true }
        : { ...state, phase: 'exterior', settled: true }

    case 'SCENE_FAILED':
      return { ...state, mode: 'fallback', phase: 'interior', settled: true, fallbackReason: event.reason }

    case 'RETRY_SCENE':
      return { ...initialState(state.motion, 'scene'), run: state.run }

    case 'ENTER':
      if (state.phase !== 'exterior') return state // ignore repeated clicks
      if (state.motion === 'reduced') return { ...state, phase: 'transition', cutTarget: 'interior', settled: false, autoEnter: false }
      return { ...state, phase: 'entering', settled: false, run: state.run + 1, autoEnter: false }

    case 'SKIP':
      if (state.phase !== 'exterior' && state.phase !== 'entering') return state
      return { ...state, phase: 'transition', cutTarget: 'interior', settled: false, autoEnter: false, run: state.run + 1 }

    case 'ENTRANCE_DONE':
      if (state.phase !== 'entering' || event.run !== state.run) return state
      return { ...state, phase: 'interior', settled: true }

    case 'CUT_DONE':
      if (state.phase !== 'transition' || !state.cutTarget) return state
      return { ...state, phase: state.cutTarget, cutTarget: null, settled: true }

    case 'REPLAY':
      if (state.phase !== 'interior' || state.mode !== 'scene') return state
      return { ...state, phase: 'transition', cutTarget: 'exterior', settled: false, autoEnter: true }

    case 'CAMERA_MOVING':
      return state.settled ? { ...state, settled: false } : state

    case 'CAMERA_SETTLED':
      return state.settled ? state : { ...state, settled: true }

    case 'SET_MOTION':
      return { ...state, motion: event.value }
  }
}
