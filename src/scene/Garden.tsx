/** The garden around the dojo: ground, raked gravel path, lanterns, hedges, trees, hills, sky. */
import * as THREE from 'three'
import { useMemo } from 'react'
import { Box } from './Building'
import { CherryTrees, type TreeSpec } from './CherryTrees'
import { useMaterials } from './materials'
import { rng } from './textures'

const TREES: TreeSpec[] = [
  // foreground pair framing the approach (canopies reach over the path → parallax)
  { position: [-3.4, 0, 11.6], scale: 1.18, seed: 4, turn: 0.4 },
  { position: [3.7, 0, 8.4], scale: 1.08, seed: 9, turn: 2.2 },
  // near the building
  { position: [-6.9, 0, 3.8], scale: 1.15, seed: 15 },
  { position: [7.2, 0, 2.6], scale: 1.2, seed: 21 },
  // side garden, seen through the open shoji
  { position: [8.6, 0, -10.2], scale: 1.1, seed: 33 },
  { position: [9.4, 0, -4.4], scale: 0.95, seed: 41 },
  { position: [-8.8, 0, -6], scale: 1.05, seed: 47 },
  // distance
  { position: [-11.5, 0, 15.5], scale: 1.25, seed: 52 },
  { position: [12, 0, 14], scale: 1.3, seed: 58 },
]

function Lantern({ at, rotation = 0 }: { at: [number, number, number]; rotation?: number }) {
  const { m } = useMaterials()
  return (
    <group position={at} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.12, 0]} material={m.stoneDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.38, 0.24, 6]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} material={m.stone} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
      </mesh>
      <mesh position={[0, 1.08, 0]} material={m.stone} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.14, 6]} />
      </mesh>
      <Box size={[0.36, 0.34, 0.36]} at={[0, 1.32, 0]} material={m.stone} />
      <Box size={[0.2, 0.2, 0.38]} at={[0, 1.32, 0]} material={m.lanternGlow} shadow={false} />
      <Box size={[0.38, 0.2, 0.2]} at={[0, 1.32, 0]} material={m.lanternGlow} shadow={false} />
      <mesh position={[0, 1.6, 0]} material={m.stoneDark} castShadow>
        <coneGeometry args={[0.46, 0.32, 6]} />
      </mesh>
      <mesh position={[0, 1.82, 0]} material={m.stone}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </mesh>
    </group>
  )
}

function Hedges() {
  const { m } = useMaterials()
  const items = useMemo(() => {
    const r = rng(8)
    const out: { p: [number, number, number]; s: [number, number, number]; light: boolean }[] = []
    const add = (x: number, z: number, s: number) => out.push({ p: [x, 0.18 * s, z], s: [0.9 * s, 0.5 * s, 0.75 * s], light: r() > 0.5 })
    ;[
      [-2.5, 3.2, 0.9], [-3.4, 3.6, 1.1], [2.6, 4.1, 1], [3.6, 4.6, 0.8], [-2.4, 7.6, 0.8], [2.5, 12.4, 0.9],
      [-5.4, 1.4, 1.2], [5.6, 1.2, 1.1], [6.4, -7.8, 1.3], [6.2, -12.8, 1.1], [-6.5, -9.5, 1.2], [-6.2, -13.4, 1],
      [-7.6, 9.2, 1.4], [8.4, 9.6, 1.3],
    ].forEach(([x, z, s]) => add(x, z, s))
    return out
  }, [])
  return (
    <group>
      {items.map((h, i) => (
        <mesh key={i} position={h.p} scale={h.s} material={h.light ? m.hedgeLight : m.hedge} castShadow receiveShadow>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
      ))}
    </group>
  )
}

function SteppingStones() {
  const { m } = useMaterials()
  const stones = useMemo(() => {
    const r = rng(17)
    return [3.0, 4.1, 5.3, 6.6, 7.9, 9.3, 10.8, 12.4, 14.0].map((z, i) => ({
      p: [(i % 2 ? 0.18 : -0.16) + (r() - 0.5) * 0.12, 0.035, z] as [number, number, number],
      s: [0.42 + r() * 0.1, 1, 0.32 + r() * 0.08] as [number, number, number],
      ry: r() * Math.PI,
    }))
  }, [])
  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} position={s.p} scale={s.s} rotation={[0, s.ry, 0]} material={m.stone} receiveShadow castShadow>
          <cylinderGeometry args={[1, 1.05, 0.07, 9]} />
        </mesh>
      ))}
    </group>
  )
}

function Fence() {
  const { m } = useMaterials()
  const posts: number[] = []
  for (let z = -18; z <= 20; z += 2.4) posts.push(z)
  return (
    <group>
      {[-12.5, 12.5].map((x) => (
        <group key={x}>
          {posts.map((z) => (
            <mesh key={z} position={[x, 0.55, z]} material={m.bamboo} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 1.1, 6]} />
            </mesh>
          ))}
          {[0.45, 0.9].map((y) => (
            <mesh key={y} position={[x, y, 1]} rotation={[Math.PI / 2, 0, 0]} material={m.bamboo}>
              <cylinderGeometry args={[0.035, 0.035, 38, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Backdrop() {
  const { m, tx } = useMaterials()
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tx.sky, side: THREE.BackSide, fog: false, depthWrite: false }), [tx.sky])
  const hills = useMemo(() => {
    const r = rng(61)
    return Array.from({ length: 9 }, (_, i) => {
      const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 1.9
      const d = 62 + r() * 18
      return { p: [Math.sin(a) * d, -6, -Math.cos(a) * d * 0.9 - 6] as [number, number, number], s: [16 + r() * 14, 11 + r() * 8, 10] as [number, number, number], far: i % 2 === 0 }
    })
  }, [])
  return (
    <group>
      <mesh material={skyMat} renderOrder={-1}>
        <sphereGeometry args={[120, 24, 16]} />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={h.p} scale={h.s} material={h.far ? m.hillsFar : m.hills}>
          <sphereGeometry args={[1, 16, 10]} />
        </mesh>
      ))}
      {/* tree masses behind the dojo */}
      {[-9, -4, 2, 7, 11].map((x, i) => (
        <mesh key={x} position={[x, 3 + (i % 2), -24 - (i % 3) * 3]} scale={[4.5, 4 + (i % 2), 3.5]} material={m.hedge}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      ))}
    </group>
  )
}

export function Garden({ blossoms, reducedMotion }: { blossoms: number; reducedMotion: boolean }) {
  const { m } = useMaterials()
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.grass} receiveShadow>
        <planeGeometry args={[150, 150]} />
      </mesh>
      {/* raked gravel courtyard and path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 9.5]} material={m.gravel} receiveShadow>
        <planeGeometry args={[3.4, 15]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 1.6]} material={m.gravel} receiveShadow>
        <planeGeometry args={[12.5, 3.4]} />
      </mesh>
      {[-1.75, 1.75].map((x) => (
        <Box key={x} size={[0.12, 0.08, 15]} at={[x, 0.03, 9.5]} material={m.stoneDark} shadow={false} />
      ))}
      <SteppingStones />
      <Lantern at={[-2.35, 0, 5.4]} rotation={0.3} />
      <Lantern at={[2.35, 0, 5.4]} rotation={-0.3} />
      <Lantern at={[7.4, 0, -9.2]} />
      <Hedges />
      <Fence />
      <CherryTrees trees={TREES} clusters={blossoms} reducedMotion={reducedMotion} />
      <Backdrop />
    </group>
  )
}
