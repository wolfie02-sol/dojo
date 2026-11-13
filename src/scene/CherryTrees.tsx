/**
 * Procedural cherry trees: merged bark geometry per tree + one instanced mesh for
 * every blossom cluster in the scene (a single draw call). Blossoms sway gently in a
 * vertex shader, so wind costs nothing on the CPU.
 */
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { palette } from '../config/theme'
import { rng } from './textures'
import { useMaterials } from './materials'

export interface TreeSpec {
  position: [number, number, number]
  scale: number
  seed: number
  /** rotation of the canopy, radians */
  turn?: number
}

/** Blossoms are removed from this corridor so the camera never brushes through them. */
function inCameraCorridor(p: THREE.Vector3) {
  return Math.abs(p.x) < 1.6 && p.y < 3.4 && p.z > -1 && p.z < 17
}

interface Grown {
  bark: THREE.BufferGeometry
  clusters: { pos: THREE.Vector3; r: number }[]
}

function growTree(spec: TreeSpec, clustersPerTree: number): Grown {
  const r = rng(spec.seed)
  const parts: THREE.BufferGeometry[] = []
  const tips: THREE.Vector3[] = []
  const up = new THREE.Vector3(0, 1, 0)

  const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    const end = start.clone().addScaledVector(dir, len)
    const g = new THREE.CylinderGeometry(rad * 0.68, rad, len, depth > 2 ? 7 : 5, 1)
    g.translate(0, len / 2, 0)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir))
    g.translate(start.x, start.y, start.z)
    parts.push(g)
    if (depth === 0) {
      tips.push(end)
      return
    }
    const n = depth >= 3 ? 2 + (r() > 0.5 ? 1 : 0) : 2
    for (let i = 0; i < n; i++) {
      const azimuth = (i / n) * Math.PI * 2 + r() * 1.4 + (spec.turn ?? 0)
      const spread = 0.45 + r() * 0.5
      const d = dir.clone()
      const side = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth))
      d.addScaledVector(side, spread * 1.3).normalize()
      // cherry trees spread wide: flatten later branches towards horizontal
      d.y = THREE.MathUtils.lerp(d.y, 0.32, depth <= 2 ? 0.45 : 0.15)
      d.normalize()
      branch(end, d, len * (0.68 + r() * 0.16), rad * 0.62, depth - 1)
      if (depth <= 2) tips.push(end.clone().addScaledVector(d, len * 0.35))
    }
  }

  const trunkDir = new THREE.Vector3((r() - 0.5) * 0.25, 1, (r() - 0.5) * 0.25).normalize()
  branch(new THREE.Vector3(0, -0.1, 0), trunkDir, 1.7, 0.2, 4)

  const bark = mergeGeometries(parts.map((p) => p.toNonIndexed()))!
  parts.forEach((p) => p.dispose())
  bark.scale(spec.scale, spec.scale, spec.scale)
  bark.translate(...spec.position)

  const clusters: Grown['clusters'] = []
  const pick = (i: number) => tips[(i * 7919) % tips.length]
  for (let i = 0; i < clustersPerTree; i++) {
    const tip = pick(i)
    const pos = tip.clone().add(new THREE.Vector3((r() - 0.5) * 1.1, (r() - 0.3) * 0.6, (r() - 0.5) * 1.1))
    pos.multiplyScalar(spec.scale).add(new THREE.Vector3(...spec.position))
    if (inCameraCorridor(pos)) continue
    clusters.push({ pos, r: (0.22 + r() * 0.24) * spec.scale })
  }
  return { bark, clusters }
}

const BLOSSOM_COLORS = [palette.sakura, palette.sakuraPale, palette.sakuraDeep, '#f7d3dc', '#fff0f3']

export function CherryTrees({ trees, clusters, reducedMotion }: { trees: TreeSpec[]; clusters: number; reducedMotion: boolean }) {
  const { m } = useMaterials()
  const grown = useMemo(() => trees.map((t) => growTree(t, clusters)), [trees, clusters])
  const all = useMemo(() => grown.flatMap((g) => g.clusters), [grown])

  const blossomGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const uniforms = useRef({ uTime: { value: 0 }, uWind: { value: reducedMotion ? 0.35 : 1 } })
  const blossomMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, emissive: new THREE.Color('#f6c9d4'), emissiveIntensity: 0.22 })
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.current.uTime
      shader.uniforms.uWind = uniforms.current.uWind
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3]);
            float h = clamp((ip.y - 2.0) * 0.25, 0.0, 1.0);
            float sway = sin(uTime * 0.7 + ip.x * 0.35 + ip.z * 0.2) + 0.5 * sin(uTime * 1.3 + ip.z * 0.6);
            transformed.x += sway * 0.05 * uWind * (0.4 + h);
            transformed.z += sway * 0.03 * uWind * (0.4 + h);
          #endif`,
        )
    }
    return mat
  }, [])

  const inst = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const mesh = inst.current
    if (!mesh) return
    const r = rng(77)
    const mtx = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const color = new THREE.Color()
    all.forEach((c, i) => {
      q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3))
      mtx.compose(c.pos, q, new THREE.Vector3(c.r * (1 + r() * 0.3), c.r * (0.75 + r() * 0.2), c.r * (1 + r() * 0.3)))
      mesh.setMatrixAt(i, mtx)
      mesh.setColorAt(i, color.set(BLOSSOM_COLORS[Math.floor(r() * BLOSSOM_COLORS.length)]))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [all])

  useEffect(() => {
    uniforms.current.uWind.value = reducedMotion ? 0.35 : 1
  }, [reducedMotion])

  useEffect(
    () => () => {
      grown.forEach((g) => g.bark.dispose())
    },
    [grown],
  )
  useEffect(() => () => {
    blossomGeo.dispose()
    blossomMat.dispose()
  }, [blossomGeo, blossomMat])

  useFrame((_, dt) => {
    uniforms.current.uTime.value += Math.min(dt, 0.05)
  })

  return (
    <group>
      {grown.map((g, i) => (
        <mesh key={i} geometry={g.bark} material={m.bark} castShadow receiveShadow />
      ))}
      <instancedMesh ref={inst} args={[blossomGeo, blossomMat, all.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  )
}
