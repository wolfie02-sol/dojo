/**
 * Falling cherry petals — one instanced mesh, updated with elapsed time.
 * Petals only fall outside the building (front garden and the side gardens).
 */
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { palette } from '../config/theme'
import { rng } from './textures'

const REGIONS = [
  { min: [-10, 0, 0.6], max: [10, 7, 18], weight: 0.7 },
  { min: [5.6, 0, -16], max: [13, 7, 0.6], weight: 0.18 },
  { min: [-13, 0, -16], max: [-5.6, 7, 0.6], weight: 0.12 },
] as const

function petalGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.5)
  s.bezierCurveTo(0.55, -0.25, 0.5, 0.35, 0.12, 0.5)
  s.lineTo(0, 0.38)
  s.lineTo(-0.12, 0.5)
  s.bezierCurveTo(-0.5, 0.35, -0.55, -0.25, 0, -0.5)
  const g = new THREE.ShapeGeometry(s, 4)
  g.scale(0.045, 0.055, 0.045)
  // a gentle cup so petals catch the light as they turn
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.pow(pos.getX(i) / 0.03, 2) * 0.006)
  g.computeVertexNormals()
  return g
}

export function Petals({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(petalGeometry, [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, emissive: new THREE.Color('#f3c4cf'), emissiveIntensity: 0.25 }), [])

  const state = useMemo(() => {
    const r = rng(101)
    const p = new Float32Array(count * 3)
    const v = new Float32Array(count * 4) // fall speed, sway freq, phase, spin
    const rot = new Float32Array(count * 3)
    const spawn = (i: number, anywhere: boolean) => {
      let roll = r()
      const reg = REGIONS.find((g) => (roll -= g.weight) < 0) ?? REGIONS[0]
      p[i * 3] = reg.min[0] + r() * (reg.max[0] - reg.min[0])
      p[i * 3 + 1] = anywhere ? r() * reg.max[1] : reg.max[1] * (0.8 + r() * 0.2)
      p[i * 3 + 2] = reg.min[2] + r() * (reg.max[2] - reg.min[2])
      v[i * 4] = 0.28 + r() * 0.3
      v[i * 4 + 1] = 0.6 + r() * 0.9
      v[i * 4 + 2] = r() * Math.PI * 2
      v[i * 4 + 3] = (r() - 0.5) * 2.4
      rot[i * 3] = r() * 6
      rot[i * 3 + 1] = r() * 6
      rot[i * 3 + 2] = r() * 6
    }
    for (let i = 0; i < count; i++) spawn(i, true)
    return { p, v, rot, spawn }
  }, [count])

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const c = new THREE.Color()
    const r = rng(3)
    for (let i = 0; i < count; i++) m.setColorAt(i, c.set(r() > 0.5 ? palette.sakura : r() > 0.5 ? palette.sakuraPale : '#f6ccd6'))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [count])

  useEffect(() => () => {
    geo.dispose()
    mat.dispose()
  }, [geo, mat])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const time = useRef(0)

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, 0.05) * (reducedMotion ? 0.45 : 1)
    time.current += dt
    const t = time.current
    const { p, v, rot, spawn } = state
    const wind = 0.12 + Math.sin(t * 0.13) * 0.08
    for (let i = 0; i < count; i++) {
      const fall = v[i * 4]
      const freq = v[i * 4 + 1]
      const phase = v[i * 4 + 2]
      p[i * 3] += (wind + Math.sin(t * freq + phase) * 0.22) * dt
      p[i * 3 + 1] -= fall * dt
      p[i * 3 + 2] += Math.cos(t * freq * 0.8 + phase) * 0.12 * dt
      rot[i * 3] += v[i * 4 + 3] * dt
      rot[i * 3 + 1] += v[i * 4 + 3] * 0.7 * dt
      if (p[i * 3 + 1] < 0.02) spawn(i, false)
      dummy.position.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2])
      dummy.rotation.set(rot[i * 3], rot[i * 3 + 1], rot[i * 3 + 2])
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
}
