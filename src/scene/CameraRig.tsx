/**
 * Connects the experience state + route to the camera director, and applies the
 * director's pose to the three.js camera each frame. Also:
 *  - widens the field of view on portrait screens, and allows a gentle drag/swipe
 *    look-around when the room still doesn't fit;
 *  - shifts the projection (setViewOffset) so the focused object stays visible
 *    beside the content panel (desktop) or above the bottom sheet (mobile).
 */
import * as THREE from 'three'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { camera as camCfg, hotspots, timings } from '../config/experience'
import type { SectionId } from '../config/site'
import { useExperience } from '../state/ExperienceContext'
import type { Phase } from '../state/machine'
import { useRoute } from '../router/router'
import { markIntroSeen } from '../lib/prefs'
import { director, pose, type Pose } from './director'

const EXTERIOR = pose(camCfg.exterior.position, camCfg.exterior.target)
const INTERIOR = pose(camCfg.interior.position, camCfg.interior.target)
/** Half-angle (radians) the interior view should cover horizontally to show every object */
const NEEDED_HALF = THREE.MathUtils.degToRad(30)

export function focusPose(id: SectionId): Pose {
  const anchor = new THREE.Vector3(...hotspots[id].position)
  const from = INTERIOR.position
  const position = from.clone().lerp(anchor, camCfg.focusDolly)
  position.y = THREE.MathUtils.lerp(from.y, anchor.y, 0.3)
  return { position, target: anchor }
}

/** How far to shift the picture (fraction of the viewport) so it isn't hidden behind the panel. Mirrors the panel CSS. */
export function panelShift(w: number, h: number) {
  if (w >= 900) {
    const panelWidth = Math.min(560, w * 0.44)
    return { x: panelWidth / 2 / w, y: 0 }
  }
  return { x: 0, y: h > w ? 0.27 : 0.2 }
}

export function CameraRig() {
  const { state, dispatch, reducedMotion } = useExperience()
  const route = useRoute()
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const gl = useThree((s) => s.gl)
  const prevPhase = useRef<Phase>('loading')
  const live = useRef({ phase: state.phase, section: route.section })
  live.current = { phase: state.phase, section: route.section }

  // React to state/route changes by choosing the next shot
  useLayoutEffect(() => {
    const prev = prevPhase.current
    prevPhase.current = state.phase
    const section = route.section
    switch (state.phase) {
      case 'loading':
      case 'exterior':
        director.snap(EXTERIOR, { doors: 0, panel: 0 })
        break
      case 'entering':
        if (prev !== 'entering') {
          const run = state.run
          director.playEntrance(timings.entranceDuration, () => {
            markIntroSeen()
            dispatch({ type: 'ENTRANCE_DONE', run })
          })
        }
        break
      case 'transition':
        break // the veil is covering the view; the cut happens when the phase changes
      case 'interior': {
        const target = section ? focusPose(section) : INTERIOR
        const panel = section ? 1 : 0
        if (prev !== 'interior' && prev !== 'entering') {
          director.snap(target, { doors: 1, panel })
          markIntroSeen()
          break
        }
        if (prev === 'entering' && !section) break
        dispatch({ type: 'CAMERA_MOVING' })
        const duration = reducedMotion ? 0 : section ? timings.focusDuration : timings.returnDuration
        director.tweenTo(target, duration, panel, () => dispatch({ type: 'CAMERA_SETTLED' }))
        break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, route.section])

  // Stop any shot if the rig unmounts
  useEffect(() => () => director.cancel(), [])

  // Drag / swipe to look around (only on narrow screens, only in the idle dojo view)
  useEffect(() => {
    const el = gl.domElement
    let drag: { x: number; yaw: number; id: number } | null = null
    const down = (e: PointerEvent) => {
      if (director.yawLimit <= 0 || live.current.phase !== 'interior' || live.current.section) return
      drag = { x: e.clientX, yaw: director.yawTarget, id: e.pointerId }
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const k = THREE.MathUtils.degToRad(70) / Math.max(320, el.clientWidth)
      director.yawTarget = drag.yaw + (e.clientX - drag.x) * k
    }
    const up = () => {
      drag = null
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  // Runs before everything else each frame (priority -1) so doors & labels read this frame's values
  useFrame((s, dt) => {
    const { width, height } = s.size
    const aspect = width / Math.max(1, height)
    const hHalf = (fovDeg: number) => Math.atan(Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2) * aspect)
    let fov = camCfg.fov
    if (hHalf(fov) < NEEDED_HALF) fov = Math.min(camCfg.maxFov, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(NEEDED_HALF) / aspect)))
    const missing = NEEDED_HALF - hHalf(fov)
    const idle = live.current.phase === 'interior' && !live.current.section
    director.yawLimit = idle && missing > 0 ? Math.min(missing + THREE.MathUtils.degToRad(4), THREE.MathUtils.degToRad(camCfg.maxLookAround)) : 0
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }

    director.update(dt)
    director.apply(cam)

    const shift = panelShift(width, height)
    const ox = shift.x * width * director.panel
    const oy = shift.y * height * director.panel
    if (ox > 0.5 || oy > 0.5) cam.setViewOffset(width, height, ox, oy, width, height)
    else if (cam.view?.enabled) cam.clearViewOffset()
  }, -1)

  return null
}
