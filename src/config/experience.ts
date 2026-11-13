/**
 * EXPERIENCE SETTINGS — timings, camera, hotspot placement, visual quality.
 *
 * Units: seconds for time, metres for distances (the dojo is ~10 m wide, 15 m deep).
 * Coordinates: x = left/right, y = up, z = towards the visitor (the entrance is at z = 0,
 * the garden is at z > 0, the back wall of the dojo is at z = -15).
 */

import type { SectionId } from './site'

export type Vec3 = [number, number, number]

export const timings = {
  /** Length of the cinematic entrance after "Enter the dojo" (recommended 5–8 s) */
  entranceDuration: 7,
  /** Doors start / finish opening at these fractions of the camera path (0 = start, 1 = end) */
  doorOpenStart: 0.3,
  doorOpenEnd: 0.62,
  /** Camera move towards an object when a section opens, and back when it closes */
  focusDuration: 0.95,
  returnDuration: 0.85,
  /** Fade used by "Skip intro", direct links and reduced motion */
  veilIn: 0.38,
  veilOut: 0.5,
  /** Same fade when reduced motion is on (kept short, opacity only) */
  veilInReduced: 0.18,
  veilOutReduced: 0.24,
  /** Delay before the replayed entrance starts moving */
  replayDelay: 0.6,
}

/** Floor height of the dojo (it sits on a low platform above the garden) */
export const FLOOR_Y = 0.45

export const camera = {
  /** Vertical field of view in landscape. Portrait screens widen it up to `maxFov`. */
  fov: 50,
  maxFov: 64,
  near: 0.05,
  far: 140,
  exterior: { position: [0, 1.65, 15] as Vec3, target: [0, 1.95, 0] as Vec3 },
  /**
   * The entrance glide. Position and target points are matched one-to-one and
   * travelled with a gentle ease-in-out. The last point must equal `interior`.
   */
  entrancePath: {
    positions: [
      [0, 1.65, 15],
      [0.15, 1.72, 9.5],
      [0.05, 1.86, 4.5],
      [0, 1.98, 1.4],
      [0, 2.04, -0.6],
      [0, 2.05, -1.2],
    ] as Vec3[],
    targets: [
      [0, 1.95, 0],
      [0, 1.98, -2],
      [0, 2.05, -6],
      [0, 2.2, -11],
      [0, 2.32, -14],
      [0, 2.35, -15],
    ] as Vec3[],
  },
  interior: { position: [0, 2.05, -1.2] as Vec3, target: [0, 2.35, -15] as Vec3 },
  /** When a section opens the camera moves this fraction of the way towards the object */
  focusDolly: 0.28,
  /** Look-around (drag / swipe) limits when the screen is too narrow to show the whole room, in degrees */
  maxLookAround: 30,
}

export interface HotspotPlacement {
  /** Where the object sits */
  position: Vec3
  /** Rotation around the vertical axis, in radians (walls facing the room) */
  rotationY: number
  /** Where the label is pinned, relative to `position` (in the object's own orientation) */
  labelOffset: Vec3
  /** Label above or below its pin — alternate neighbours so labels never collide on small screens */
  placement: 'above' | 'below'
}

const LEFT_WALL = -4.88
const RIGHT_WALL = 4.88
const BACK_WALL = -14.95

/** Where each section's object is in the dojo. */
export const hotspots: Record<SectionId, HotspotPlacement> = {
  about: { position: [0, 2.6, BACK_WALL], rotationY: 0, labelOffset: [0, -1.3, 0.5], placement: 'below' },
  sensei: { position: [-3, 2.85, BACK_WALL], rotationY: 0, labelOffset: [0, 0.78, 0.1], placement: 'above' },
  blackBelts: { position: [3, 2.8, BACK_WALL], rotationY: 0, labelOffset: [0, 0.86, 0.1], placement: 'above' },
  schedule: { position: [LEFT_WALL, 2.55, -13.5], rotationY: Math.PI / 2, labelOffset: [0, -0.9, 0.1], placement: 'below' },
  links: { position: [LEFT_WALL, 2.55, -10.5], rotationY: Math.PI / 2, labelOffset: [0, 0.78, 0.1], placement: 'above' },
  calendar: { position: [RIGHT_WALL, 2.55, -13.5], rotationY: -Math.PI / 2, labelOffset: [0, -0.95, 0.1], placement: 'below' },
  contact: { position: [RIGHT_WALL, 2.475, -9.75], rotationY: -Math.PI / 2, labelOffset: [0, 1.22, 0.3], placement: 'above' },
}

export type QualityTier = 'low' | 'medium' | 'high'

export interface QualityPreset {
  /** Device-pixel-ratio cap (sharpness vs. GPU cost) */
  maxDpr: number
  antialias: boolean
  shadows: boolean
  shadowMapSize: number
  petals: number
  /** Blossom clusters per tree */
  blossoms: number
  /** Canvas texture resolution */
  textureSize: number
}

export const quality: Record<QualityTier, QualityPreset> = {
  high: { maxDpr: 2, antialias: true, shadows: true, shadowMapSize: 2048, petals: 420, blossoms: 120, textureSize: 1024 },
  medium: { maxDpr: 1.5, antialias: true, shadows: true, shadowMapSize: 1024, petals: 240, blossoms: 90, textureSize: 512 },
  low: { maxDpr: 1.25, antialias: false, shadows: true, shadowMapSize: 512, petals: 110, blossoms: 60, textureSize: 512 },
}
