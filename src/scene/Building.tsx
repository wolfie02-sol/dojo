/**
 * The dojo building — one continuous model seen from outside and inside, so the
 * camera can glide through the doorway without any scene swap.
 *
 * Plan: 10 m wide (x −5…5), 15 m deep (z 0…−15), floor raised to FLOOR_Y,
 * gable roof whose triangular end faces the garden. Pillars every 3 m.
 */
import * as THREE from 'three'
import { useEffect, useMemo, type ReactNode } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { FLOOR_Y } from '../config/experience'
import { useMaterials } from './materials'
import { worldBox } from './realAssets'

/** worldBox geometry that is disposed with its component */
export function useWorldBox(w: number, h: number, d: number) {
  const g = useMemo(() => worldBox(w, h, d), [w, h, d])
  useEffect(() => () => g.dispose(), [g])
  return g
}

export const HALF_W = 5
export const DEPTH = 15
export const WALL_TOP = FLOOR_Y + 4.3 // 4.75
const T = 0.2 // wall thickness
const DOOR_HALF = 1.5
export const DOOR_TOP = FLOOR_Y + 2.6
const RIDGE_Y = 7.25
const EAVE_X = 6.4
const EAVE_Y = 4.35
const ROOF_FRONT = 1.7
const ROOF_BACK = -DEPTH - 1.4

type MeshProps = ThreeElements['mesh']

/** Box with given size and centre */
export function Box({ size, at, material, shadow = true, ...rest }: { size: [number, number, number]; at: [number, number, number]; material: THREE.Material | THREE.Material[]; shadow?: boolean } & Omit<MeshProps, 'position'>) {
  const geo = useWorldBox(size[0], size[1], size[2])
  return <mesh geometry={geo} position={at} material={material} castShadow={shadow} receiveShadow {...rest} />
}

/** Box from min/max corners — easier to reason about for walls */
function Slab({ min, max, material, shadow = true }: { min: [number, number, number]; max: [number, number, number]; material: THREE.Material | THREE.Material[]; shadow?: boolean }) {
  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const at: [number, number, number] = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2]
  return <Box size={size} at={at} material={material} shadow={shadow} />
}

const PILLAR_Z = [0, -3, -6, -9, -12, -15]
const MID_LOW = FLOOR_Y + 0.9 // top of wooden wainscot
const MID_HIGH = FLOOR_Y + 3.15 // top of shoji band / nageshi rail

/** Bay contents for each side wall, from the entrance to the back (5 bays of 3 m). */
type Bay = 'shoji' | 'plaster' | 'open'
const LEFT_BAYS: Bay[] = ['shoji', 'shoji', 'shoji', 'plaster', 'plaster']
const RIGHT_BAYS: Bay[] = ['shoji', 'open', 'shoji', 'open', 'plaster']

function SideWall({ side }: { side: -1 | 1 }) {
  const { m } = useMaterials()
  const bays = side < 0 ? LEFT_BAYS : RIGHT_BAYS
  const x0 = side * HALF_W - T / 2
  const x1 = side * HALF_W + T / 2
  const xmin = Math.min(x0, x1)
  const xmax = Math.max(x0, x1)
  const parts: ReactNode[] = []
  bays.forEach((bay, i) => {
    const zmax = PILLAR_Z[i]
    const zmin = PILLAR_Z[i + 1]
    parts.push(<Slab key={`w${i}`} min={[xmin, FLOOR_Y, zmin]} max={[xmax, MID_LOW, zmax]} material={m.wainscot} />)
    parts.push(<Slab key={`u${i}`} min={[xmin, MID_HIGH, zmin]} max={[xmax, WALL_TOP, zmax]} material={m.plaster} />)
    if (bay === 'plaster') parts.push(<Slab key={`p${i}`} min={[xmin, MID_LOW, zmin]} max={[xmax, MID_HIGH, zmax]} material={m.plaster} />)
    if (bay === 'shoji') {
      // two shoji panels per bay
      for (let k = 0; k < 2; k++) {
        const a = zmin + (k * 3) / 2
        parts.push(<Slab key={`s${i}${k}`} min={[side * HALF_W - 0.03, MID_LOW, a + 0.02]} max={[side * HALF_W + 0.03, MID_HIGH, a + 1.48]} material={m.shoji} shadow={false} />)
      }
    }
    if (bay === 'open') {
      // both panels slid to one side — the garden shows through the other half
      parts.push(<Slab key={`o${i}`} min={[side * HALF_W - 0.03, MID_LOW, zmin + 0.04]} max={[side * HALF_W + 0.03, MID_HIGH, zmin + 1.48]} material={m.shoji} shadow={false} />)
      parts.push(<Slab key={`o2${i}`} min={[side * HALF_W - 0.09, MID_LOW, zmin + 0.1]} max={[side * HALF_W - 0.04, MID_HIGH, zmin + 1.5]} material={m.shoji} shadow={false} />)
      // sill and threshold
      parts.push(<Slab key={`t${i}`} min={[xmin - 0.02, MID_LOW - 0.02, zmin]} max={[xmax + 0.02, MID_LOW + 0.03, zmax]} material={m.darkWood} />)
    }
    // horizontal rails
    parts.push(<Slab key={`r${i}`} min={[xmin - 0.04, MID_HIGH - 0.06, zmin]} max={[xmax + 0.04, MID_HIGH + 0.06, zmax]} material={m.darkWood} />)
  })
  // pillars
  PILLAR_Z.forEach((z) =>
    parts.push(<Slab key={`c${z}`} min={[side * HALF_W - 0.14, 0, z - 0.12]} max={[side * HALF_W + 0.14, WALL_TOP, z + 0.12]} material={m.post} />),
  )
  return <group>{parts}</group>
}

function FrontWall() {
  const { m, tx } = useMaterials()
  const z0 = -T / 2
  const z1 = T / 2
  const signMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tx.sign, roughness: 0.6 }), [tx.sign])
  return (
    <group>
      <Slab min={[-HALF_W, FLOOR_Y, z0]} max={[-DOOR_HALF, WALL_TOP, z1]} material={m.plaster} />
      <Slab min={[DOOR_HALF, FLOOR_Y, z0]} max={[HALF_W, WALL_TOP, z1]} material={m.plaster} />
      <Slab min={[-DOOR_HALF, DOOR_TOP, z0]} max={[DOOR_HALF, WALL_TOP, z1]} material={m.plaster} />
      {/* exposed timber frame on the facade */}
      {[-DOOR_HALF - 0.1, DOOR_HALF + 0.1, -3.3, 3.3].map((x) => (
        <Slab key={x} min={[x - 0.1, FLOOR_Y, z0 - 0.02]} max={[x + 0.1, WALL_TOP, z1 + 0.03]} material={m.post} />
      ))}
      <Slab min={[-HALF_W - 0.1, DOOR_TOP, z0 - 0.03]} max={[HALF_W + 0.1, DOOR_TOP + 0.16, z1 + 0.05]} material={m.darkWood} />
      <Slab min={[-HALF_W - 0.1, WALL_TOP - 0.18, z0 - 0.03]} max={[HALF_W + 0.1, WALL_TOP, z1 + 0.05]} material={m.darkWood} />
      {/* door tracks */}
      <Slab min={[-HALF_W + 0.4, FLOOR_Y - 0.02, z1]} max={[HALF_W - 0.4, FLOOR_Y + 0.025, z1 + 0.14]} material={m.darkWood} shadow={false} />
      <Slab min={[-HALF_W + 0.4, DOOR_TOP - 0.06, z1]} max={[HALF_W - 0.4, DOOR_TOP + 0.02, z1 + 0.16]} material={m.darkWood} shadow={false} />
      {/* entrance sign */}
      <mesh position={[0, DOOR_TOP + 0.72, z1 + 0.04]} material={signMat} castShadow>
        <boxGeometry args={[1.7, 0.42, 0.05]} />
      </mesh>
      <Gable z={z1 + 0.001} />
      <Gable z={-DEPTH} />
    </group>
  )
}

/** Plaster triangle between the wall top and the roof, with a timber king post */
function Gable({ z }: { z: number }) {
  const { m } = useMaterials()
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    const under = (x: number) => RIDGE_Y - 0.3 - (Math.abs(x) / EAVE_X) * (RIDGE_Y - EAVE_Y)
    s.moveTo(-HALF_W - 0.1, WALL_TOP)
    s.lineTo(HALF_W + 0.1, WALL_TOP)
    s.lineTo(HALF_W + 0.1, under(HALF_W + 0.1))
    s.lineTo(0, under(0))
    s.lineTo(-HALF_W - 0.1, under(HALF_W + 0.1))
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false })
    return g
  }, [])
  return (
    <group position={[0, 0, z - T]}>
      <mesh geometry={geo} material={m.plaster} castShadow receiveShadow />
      <Slab min={[-0.09, WALL_TOP, T - 0.02]} max={[0.09, RIDGE_Y - 0.35, T + 0.05]} material={m.post} />
      <Slab min={[-HALF_W, WALL_TOP + 1.05, T - 0.02]} max={[HALF_W, WALL_TOP + 1.2, T + 0.05]} material={m.darkWood} />
    </group>
  )
}

function Roof() {
  const { m } = useMaterials()
  const run = EAVE_X
  const rise = RIDGE_Y - EAVE_Y
  const len = Math.hypot(run, rise) + 0.25
  const angle = Math.atan2(rise, run)
  const depth = ROOF_FRONT - ROOF_BACK
  const zc = (ROOF_FRONT + ROOF_BACK) / 2
  // box faces: +x, -x, +y (tiles), -y (ceiling boards), +z, -z
  const mats = [m.fascia, m.fascia, m.roofTop, m.roofUnder, m.fascia, m.fascia]
  const roofGeo = useWorldBox(len, 0.26, depth)
  const bargeGeo = useWorldBox(len, 0.38, 0.12)
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[(side * run) / 2, (RIDGE_Y + EAVE_Y) / 2 + 0.05, zc]}
          rotation={[0, 0, -side * angle]}
          material={mats}
          geometry={roofGeo}
          castShadow
          receiveShadow
        />
      ))}
      {/* ridge cap */}
      <Box size={[0.5, 0.32, depth + 0.2]} at={[0, RIDGE_Y + 0.2, zc]} material={m.fascia} />
      {/* barge boards along the front gable */}
      {[-1, 1].map((side) => (
        <mesh key={`b${side}`} position={[(side * run) / 2, (RIDGE_Y + EAVE_Y) / 2 - 0.06, ROOF_FRONT + 0.02]} rotation={[0, 0, -side * angle]} material={m.fascia} geometry={bargeGeo} castShadow />
      ))}
    </group>
  )
}

function Ceiling() {
  const { m } = useMaterials()
  return (
    <group>
      {/* tie beams across the room at each pillar line */}
      {PILLAR_Z.map((z) => (
        <Box key={z} size={[HALF_W * 2 + 0.2, 0.3, 0.24]} at={[0, WALL_TOP + 0.05, z]} material={m.beam} />
      ))}
      {/* ridge beam and purlins */}
      <Box size={[0.26, 0.3, DEPTH - 0.1]} at={[0, RIDGE_Y - 0.55, -DEPTH / 2]} material={m.beam} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.2, 0.24, DEPTH - 0.1]} at={[s * 2.6, RIDGE_Y - 0.55 - 1.18, -DEPTH / 2]} material={m.beam} />
      ))}
      {/* struts from tie beams to ridge */}
      {PILLAR_Z.slice(1, -1).map((z) => (
        <Box key={`k${z}`} size={[0.16, RIDGE_Y - 0.7 - WALL_TOP, 0.16]} at={[0, (RIDGE_Y - 0.7 + WALL_TOP) / 2 + 0.1, z]} material={m.beam} />
      ))}
    </group>
  )
}

/** Tokonoma alcove on the back wall (holds the calligraphy scroll — the "About" object). */
function Tokonoma() {
  const { m } = useMaterials()
  const zb = -DEPTH
  return (
    <group>
      <Slab min={[-1.3, FLOOR_Y, zb]} max={[1.3, FLOOR_Y + 0.16, zb + 0.6]} material={m.darkWood} />
      <Slab min={[-1.42, FLOOR_Y, zb]} max={[-1.26, WALL_TOP, zb + 0.62]} material={m.post} />
      <Slab min={[1.26, FLOOR_Y, zb]} max={[1.42, WALL_TOP, zb + 0.62]} material={m.post} />
      <Slab min={[-1.42, FLOOR_Y + 3.45, zb]} max={[1.42, FLOOR_Y + 3.62, zb + 0.62]} material={m.darkWood} />
      {/* small vase with a cherry branch */}
      <mesh position={[0.72, FLOOR_Y + 0.33, zb + 0.32]} material={m.vase} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.34, 16]} />
      </mesh>
    </group>
  )
}

export function Building() {
  const { m } = useMaterials()
  return (
    <group>
      {/* raised floor and stone foundation */}
      <Slab min={[-HALF_W - 0.15, 0, -DEPTH - 0.15]} max={[HALF_W + 0.15, FLOOR_Y - 0.06, 0.15]} material={m.stoneBase} />
      <Box size={[HALF_W * 2, 0.06, DEPTH]} at={[0, FLOOR_Y - 0.03, -DEPTH / 2]} material={m.floor} shadow={false} />
      {/* engawa veranda and stepping stone */}
      <Slab min={[-HALF_W - 0.6, FLOOR_Y - 0.1, 0.1]} max={[HALF_W + 0.6, FLOOR_Y, 1.45]} material={m.deck} />
      {[-HALF_W - 0.45, -2.2, 2.2, HALF_W + 0.45].map((x) => (
        <Slab key={x} min={[x - 0.08, 0, 1.25]} max={[x + 0.08, FLOOR_Y - 0.1, 1.41]} material={m.darkWood} />
      ))}
      <Slab min={[-0.75, 0, 1.6]} max={[0.75, 0.24, 2.2]} material={m.stone} />
      <SideWall side={-1} />
      <SideWall side={1} />
      <FrontWall />
      <Slab min={[-HALF_W, FLOOR_Y, -DEPTH - T]} max={[HALF_W, WALL_TOP, -DEPTH]} material={m.plaster} />
      <Ceiling />
      <Tokonoma />
      <Roof />
    </group>
  )
}
