/**
 * Procedural cherry trees.
 *  - Bark: merged branch geometry per tree, photographic sakura bark texture.
 *  - Blossoms: clusters of individual flowers painted on a canvas, placed on crossed
 *    cards (one instanced mesh = one draw call). Normals point away from the canopy
 *    centre so the whole crown is lit like a soft volume, and the alpha-tested
 *    flowers cast dappled shadows. Wind sways the cards in the vertex shader.
 */
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
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
  if (Math.abs(p.x) < 6.4 && p.z > -16.4 && p.z < 1.9 && p.y < 9) return true // inside / against the building
  return Math.abs(p.x) < 1.7 && p.y < 3.5 && p.z > -1 && p.z < 17
}

interface Cluster {
  pos: THREE.Vector3
  r: number
  center: THREE.Vector3
}
interface Grown {
  bark: THREE.BufferGeometry
  clusters: Cluster[]
}

function growTree(spec: TreeSpec, clustersPerTree: number): Grown {
  const r = rng(spec.seed)
  const parts: THREE.BufferGeometry[] = []
  const tips: THREE.Vector3[] = []
  const up = new THREE.Vector3(0, 1, 0)

  const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    const end = start.clone().addScaledVector(dir, len)
    const g = new THREE.CylinderGeometry(rad * 0.68, rad, len, depth > 2 ? 9 : 6, 1)
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

  // canopy centre = average of the tips
  const center = tips.reduce((a, t) => a.add(t), new THREE.Vector3()).divideScalar(tips.length)
  center.y -= 0.6
  center.multiplyScalar(spec.scale).add(new THREE.Vector3(...spec.position))

  const clusters: Cluster[] = []
  const pick = (i: number) => tips[(i * 7919) % tips.length]
  for (let i = 0; i < clustersPerTree; i++) {
    const tip = pick(i)
    const pos = tip.clone().add(new THREE.Vector3((r() - 0.5) * 1.2, (r() - 0.3) * 0.7, (r() - 0.5) * 1.2))
    pos.multiplyScalar(spec.scale).add(new THREE.Vector3(...spec.position))
    if (inCameraCorridor(pos)) continue
    clusters.push({ pos, r: (0.55 + r() * 0.45) * spec.scale, center })
  }
  return { bark, clusters }
}

/** Paint a cluster of cherry flowers (with a few young leaves) on a transparent canvas. */
function blossomTexture(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const r = rng(404)
  const s = size / 512
  const flower = (x: number, y: number, rad: number, rot: number, tone: number) => {
    const petal = ['#fff6f8', '#fde4ea', '#f9cfdb', '#f4b9c9'][tone]
    for (let k = 0; k < 5; k++) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot + (k * Math.PI * 2) / 5)
      const g = ctx.createLinearGradient(0, 0, 0, -rad)
      g.addColorStop(0, '#e98fa7')
      g.addColorStop(0.35, petal)
      g.addColorStop(1, petal)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(rad * 0.55, -rad * 0.25, rad * 0.5, -rad * 0.95, rad * 0.12, -rad)
      ctx.lineTo(0, -rad * 0.86) // the notch at the petal tip
      ctx.lineTo(-rad * 0.12, -rad)
      ctx.bezierCurveTo(-rad * 0.5, -rad * 0.95, -rad * 0.55, -rad * 0.25, 0, 0)
      ctx.fill()
      ctx.restore()
    }
    ctx.fillStyle = '#c75b78'
    ctx.beginPath()
    ctx.arc(x, y, rad * 0.16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f2d27a'
    for (let k = 0; k < 7; k++) {
      const a = r() * Math.PI * 2
      ctx.beginPath()
      ctx.arc(x + Math.cos(a) * rad * 0.3, y + Math.sin(a) * rad * 0.3, rad * 0.04, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // twigs
  ctx.strokeStyle = 'rgba(70,45,35,0.9)'
  ctx.lineCap = 'round'
  for (let k = 0; k < 5; k++) {
    ctx.lineWidth = (3 + r() * 3) * s
    ctx.beginPath()
    const a = r() * Math.PI * 2
    ctx.moveTo(size / 2, size / 2)
    ctx.quadraticCurveTo(size / 2 + Math.cos(a + 0.4) * size * 0.2, size / 2 + Math.sin(a + 0.4) * size * 0.2, size / 2 + Math.cos(a) * size * 0.4, size / 2 + Math.sin(a) * size * 0.4)
    ctx.stroke()
  }
  // young reddish-green leaves
  for (let k = 0; k < 14; k++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * size * 0.38
    ctx.save()
    ctx.translate(size / 2 + Math.cos(a) * d, size / 2 + Math.sin(a) * d)
    ctx.rotate(r() * Math.PI * 2)
    ctx.fillStyle = r() > 0.5 ? '#7d8a4a' : '#8f6a4a'
    ctx.beginPath()
    ctx.ellipse(0, 0, 9 * s, 4 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  // flowers: denser in the middle, fewer at the ragged edge
  for (let k = 0; k < 95; k++) {
    const a = r() * Math.PI * 2
    const d = Math.pow(r(), 0.7) * size * 0.43
    flower(size / 2 + Math.cos(a) * d, size / 2 + Math.sin(a) * d, (14 + r() * 12) * s, r() * Math.PI, Math.floor(r() * 4))
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.generateMipmaps = true
  return tex
}

const CARD_TINTS = ['#ffffff', '#fff3f6', '#ffe8ee', '#fbe0e8', '#ffffff']

export function CherryTrees({ trees, clusters, reducedMotion }: { trees: TreeSpec[]; clusters: number; reducedMotion: boolean }) {
  const { m } = useMaterials()
  const grown = useMemo(() => trees.map((t) => growTree(t, clusters)), [trees, clusters])
  const all = useMemo(() => grown.flatMap((g) => g.clusters), [grown])
  const CARDS = 3 // crossed cards per cluster
  const count = all.length * CARDS

  const tex = useMemo(() => blossomTexture(512), [])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    const dirs = new Float32Array(count * 3)
    all.forEach((c, i) => {
      const d = c.pos.clone().sub(c.center).normalize()
      d.y = Math.max(d.y, -0.2) + 0.35 // crowns are lit mostly from above
      d.normalize()
      for (let k = 0; k < CARDS; k++) dirs.set([d.x, d.y, d.z], (i * CARDS + k) * 3)
    })
    g.setAttribute('aDir', new THREE.InstancedBufferAttribute(dirs, 3))
    return g
  }, [all, count])

  const uniforms = useRef({ uTime: { value: 0 }, uWind: { value: reducedMotion ? 0.35 : 1 } })
  const windChunk = `#include <begin_vertex>
    #ifdef USE_INSTANCING
      vec3 ip = vec3(instanceMatrix[3]);
      float h = clamp((ip.y - 2.0) * 0.25, 0.0, 1.0);
      float sway = sin(uTime * 0.7 + ip.x * 0.35 + ip.z * 0.2) + 0.5 * sin(uTime * 1.3 + ip.z * 0.6);
      transformed.x += sway * 0.04 * uWind * (0.4 + h);
      transformed.y += sway * 0.015 * uWind;
    #endif`

  const mat = useMemo(() => {
    const mtl = new THREE.MeshStandardMaterial({
      map: tex,
      alphaTest: 0.42,
      side: THREE.DoubleSide,
      roughness: 0.75,
      emissive: new THREE.Color('#f7c7d4'),
      emissiveIntensity: 0.12,
    })
    mtl.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.current.uTime
      shader.uniforms.uWind = uniforms.current.uWind
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;\nattribute vec3 aDir;')
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          #ifdef USE_INSTANCING
            // soft "volume" shading: normals point out of the canopy
            objectNormal = normalize(mix(objectNormal, inverse(mat3(instanceMatrix)) * aDir, 0.8));
          #endif`,
        )
        .replace('#include <begin_vertex>', windChunk)
    }
    return mtl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex])

  // shadows keep the flower cut-outs (dappled light under the trees)
  const depthMat = useMemo(() => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.42, side: THREE.DoubleSide }), [tex])

  const inst = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const mesh = inst.current
    if (!mesh) return
    const r = rng(77)
    const mtx = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const color = new THREE.Color()
    const scale = new THREE.Vector3()
    all.forEach((c, i) => {
      const yaw = r() * Math.PI
      for (let k = 0; k < CARDS; k++) {
        // three cards crossed around the cluster, each tilted a little
        e.set((r() - 0.5) * 0.9 + (k === 2 ? Math.PI / 2 : 0), yaw + (k * Math.PI) / 3, (r() - 0.5) * 0.6)
        q.setFromEuler(e)
        const s = c.r * (0.85 + r() * 0.35) * 2
        scale.set(s, s, s)
        mtx.compose(c.pos, q, scale)
        mesh.setMatrixAt(i * CARDS + k, mtx)
        mesh.setColorAt(i * CARDS + k, color.set(CARD_TINTS[Math.floor(r() * CARD_TINTS.length)]))
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [all])

  useEffect(() => {
    uniforms.current.uWind.value = reducedMotion ? 0.35 : 1
  }, [reducedMotion])
  useEffect(() => () => grown.forEach((g) => g.bark.dispose()), [grown])
  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
      depthMat.dispose()
      tex.dispose()
    },
    [geo, mat, depthMat, tex],
  )

  useFrame((_, dt) => {
    uniforms.current.uTime.value += Math.min(dt, 0.05)
  })

  return (
    <group>
      {grown.map((g, i) => (
        <mesh key={i} geometry={g.bark} material={m.bark} castShadow receiveShadow />
      ))}
      <instancedMesh ref={inst} args={[geo, mat, count]} customDepthMaterial={depthMat} castShadow receiveShadow frustumCulled={false} />
    </group>
  )
}
