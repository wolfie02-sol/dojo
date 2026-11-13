/**
 * Two sliding lattice doors (hikido). Their opening is read every frame from the
 * camera director, so they always move in lock-step with the camera.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOOR_Y } from '../config/experience'
import { director } from './director'
import { useMaterials } from './materials'

const W = 1.56
const H = 2.6
const Z = 0.2
const TRAVEL = 1.62

export function Doors() {
  const { m } = useMaterials()
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)

  useFrame(() => {
    // tiny ease on top of the director's curve: doors start slow, glide, and soften as they meet the stop
    const d = director.doors
    const e = d * d * (3 - 2 * d)
    if (left.current) left.current.position.x = -W / 2 + 0.02 - e * TRAVEL
    if (right.current) right.current.position.x = W / 2 - 0.02 + e * TRAVEL
  })

  return (
    <group position={[0, FLOOR_Y + H / 2 + 0.01, 0]}>
      {[left, right].map((ref, i) => (
        <group key={i} ref={ref} position={[i === 0 ? -W / 2 : W / 2, 0, i === 0 ? Z : Z + 0.07]}>
          <mesh material={m.door} castShadow receiveShadow>
            <boxGeometry args={[W, H, 0.06]} />
          </mesh>
          {/* frame */}
          <mesh position={[0, H / 2 - 0.04, 0]} material={m.darkWood} castShadow>
            <boxGeometry args={[W, 0.08, 0.08]} />
          </mesh>
          <mesh position={[0, -H / 2 + 0.06, 0]} material={m.darkWood}>
            <boxGeometry args={[W, 0.12, 0.08]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[(s * (W - 0.08)) / 2, 0, 0]} material={m.darkWood}>
              <boxGeometry args={[0.08, H, 0.08]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
