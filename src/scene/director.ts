/**
 * The camera director — the ONE system that moves the camera.
 *
 * It plays "shots": the entrance path, short tweens (section focus / return) or a
 * held pose. Everything advances with elapsed time (seconds), never frame count,
 * and a new shot always starts from wherever the camera currently is, so
 * interrupting a move (navigation, skip, resize) never jumps.
 *
 * The door opening is derived from the same entrance progress value, so the
 * doors and the camera can never drift apart.
 */
import * as THREE from 'three'
import { camera as camCfg, timings, type Vec3 } from '../config/experience'

export interface Pose {
  position: THREE.Vector3
  target: THREE.Vector3
}

export const pose = (p: Vec3, t: Vec3): Pose => ({ position: new THREE.Vector3(...p), target: new THREE.Vector3(...t) })

type Shot =
  | { kind: 'path'; elapsed: number; duration: number; onDone: () => void }
  | { kind: 'tween'; elapsed: number; duration: number; from: Pose; to: Pose; fromPanel: number; toPanel: number; onDone: () => void }

/** Gentle ease-in-out (sine): zero velocity at both ends, no sudden acceleration. */
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
/** Slightly firmer ease for short moves */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

class Director {
  readonly current: Pose = pose(camCfg.exterior.position, camCfg.exterior.target)
  /** 0 = doors closed, 1 = fully open */
  doors = 0
  /** 0..1 how much the view is shifted to make room for the content panel */
  panel = 0
  /** Look-around (yaw, radians) on narrow screens */
  yaw = 0
  yawTarget = 0
  yawLimit = 0

  private shot: Shot | null = null
  private resumed = false

  /** Call when the page becomes visible again after being hidden */
  notifyResume() {
    this.resumed = true
  }
  private readonly posCurve = new THREE.CatmullRomCurve3(camCfg.entrancePath.positions.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
  private readonly tgtCurve = new THREE.CatmullRomCurve3(camCfg.entrancePath.targets.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
  private readonly tmp = new THREE.Vector3()

  get moving() {
    return this.shot !== null
  }

  /** Cut instantly to a pose (used behind the veil or on first load). */
  snap(p: Pose, opts: { doors?: number; panel?: number } = {}) {
    this.shot = null
    this.current.position.copy(p.position)
    this.current.target.copy(p.target)
    if (opts.doors !== undefined) this.doors = opts.doors
    if (opts.panel !== undefined) this.panel = opts.panel
    this.yaw = this.yawTarget = 0
  }

  playEntrance(duration: number, onDone: () => void) {
    this.yaw = this.yawTarget = 0
    this.panel = 0
    this.shot = { kind: 'path', elapsed: 0, duration: Math.max(0.5, duration), onDone }
    this.samplePath(0)
  }

  tweenTo(to: Pose, duration: number, toPanel: number, onDone: () => void) {
    // Bake the current look-around into the starting pose so the move begins exactly where we are.
    const from: Pose = { position: this.current.position.clone(), target: this.lookTarget(this.current, new THREE.Vector3()) }
    this.yaw = this.yawTarget = 0
    if (duration <= 0.001) {
      this.snap(to, { panel: toPanel })
      onDone()
      return
    }
    this.shot = { kind: 'tween', elapsed: 0, duration, from, to: { position: to.position.clone(), target: to.target.clone() }, fromPanel: this.panel, toPanel, onDone }
  }

  cancel() {
    this.shot = null
  }

  /** Advance by `dt` seconds. */
  update(dt: number) {
    // Time-based on every device (slow frames still finish on time). After the tab was hidden
    // (rendering paused), the first delta is replaced so the animation resumes instead of jumping.
    const step = this.resumed ? 1 / 60 : Math.min(dt, 2)
    this.resumed = false
    const shot = this.shot
    if (shot) {
      shot.elapsed += step
      const t = Math.min(shot.elapsed / shot.duration, 1)
      if (shot.kind === 'path') {
        this.samplePath(easeInOutSine(t))
      } else {
        const e = easeInOutCubic(t)
        this.current.position.lerpVectors(shot.from.position, shot.to.position, e)
        this.current.target.lerpVectors(shot.from.target, shot.to.target, e)
        this.panel = THREE.MathUtils.lerp(shot.fromPanel, shot.toPanel, e)
      }
      if (t >= 1) {
        this.shot = null
        shot.onDone()
      }
    }
    // Damped look-around (user-driven only — nothing drifts on its own)
    this.yawTarget = THREE.MathUtils.clamp(this.yawTarget, -this.yawLimit, this.yawLimit)
    this.yaw += (this.yawTarget - this.yaw) * (1 - Math.exp(-step * 9))
    if (Math.abs(this.yawTarget - this.yaw) < 1e-5) this.yaw = this.yawTarget
  }

  /** Apply to a three.js camera */
  apply(cam: THREE.PerspectiveCamera) {
    cam.position.copy(this.current.position)
    cam.lookAt(this.lookTarget(this.current, this.tmp))
  }

  /** Turn the view so that `point` is centred, within the look-around limits. */
  lookToward(point: THREE.Vector3) {
    if (this.yawLimit <= 0 || this.shot) return
    const base = Math.atan2(this.current.target.x - this.current.position.x, -(this.current.target.z - this.current.position.z))
    const wanted = Math.atan2(point.x - this.current.position.x, -(point.z - this.current.position.z))
    this.yawTarget = THREE.MathUtils.clamp(-(wanted - base), -this.yawLimit, this.yawLimit)
  }

  private lookTarget(p: Pose, out: THREE.Vector3) {
    out.copy(p.target).sub(p.position)
    if (this.yaw !== 0) out.applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.yaw)
    return out.add(p.position)
  }

  private samplePath(u: number) {
    // Arc-length parameter for an even glide; targets follow the matching knot segment.
    this.posCurve.getPointAt(u, this.current.position)
    const t = this.posCurve.getUtoTmapping(u, u * this.posCurve.getLength())
    this.tgtCurve.getPoint(t, this.current.target)
    this.doors = smoothstep(timings.doorOpenStart, timings.doorOpenEnd, u)
  }
}

export const director = new Director()
