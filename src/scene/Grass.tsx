/**
 * Lawn grass: thousands of tapered blades in one instanced mesh. Wind is computed in
 * the vertex shader (bends more towards the tip), so it costs nothing on the CPU.
 * Blades are kept off the gravel path, the building and the veranda.
 */
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rng } from './textures'

function bladeGeometry() {
  // 4 segments, narrowing to a point; uv.y = 0 at the root, 1 at the tip
  const segs = 4
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const w = 0.028 * (1 - t * 0.9)
    pos.push(-w, t, 0, w, t, 0)
    uv.push(0, t, 1, t)
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function allowed(x: number, z: number) {
  if (Math.abs(x) < 2.0 && z > 1.4 && z < 26) return false // gravel path and courtyard
  if (Math.abs(x) < 6.6 && z > -16 && z < 3.4) return false // building, veranda, front gravel
  if (Math.abs(x) > 12.2) return false // beyond the fence
  return true
}

export function Grass({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const geo = useMemo(bladeGeometry, [])
  const uniforms = useRef({ uTime: { value: 0 }, uWind: { value: reducedMotion ? 0.3 : 1 } })
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.85, color: '#ffffff' })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.current.uTime
      shader.uniforms.uWind = uniforms.current.uWind
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;\nvarying float vTip;')
        .replace(
          '#include <beginnormal_vertex>',
          '#include <beginnormal_vertex>\nobjectNormal = vec3(0.0, 1.0, 0.0); // lit like a lawn, not like flat cards',
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vTip = uv.y;
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3]);
            float gust = sin(uTime * 1.1 + ip.x * 0.45 + ip.z * 0.3) * 0.6 + sin(uTime * 2.3 + ip.z * 1.7) * 0.25;
            float bend = uv.y * uv.y * uWind;
            transformed.x += gust * 0.08 * bend;
            transformed.z += gust * 0.035 * bend;
          #endif`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vTip;')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.6, 1.1, vTip); // darker at the roots')
    }
    return m
  }, [])

  const mesh = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const im = mesh.current
    if (!im) return
    const r = rng(2024)
    const mtx = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    const c = new THREE.Color()
    const greens = ['#7d9a46', '#8aa552', '#6f8c3e', '#9aae5e', '#a3ad66', '#86983f']
    let n = 0
    let guard = 0
    while (n < count && guard++ < count * 6) {
      // denser near the path where the camera passes, sparser far away
      // most blades where the camera looks (either side of the approach), the rest spread out
      const near = r() < 0.8
      const x = near ? (r() - 0.5) * 18 : (r() - 0.5) * 24.4
      const z = near ? -2 + r() * 22 : -18 + r() * 42
      if (!allowed(x, z)) continue
      p.set(x, 0, z)
      e.set((r() - 0.5) * 0.35, r() * Math.PI, (r() - 0.5) * 0.35)
      q.setFromEuler(e)
      const h = 0.05 + r() * r() * 0.16
      s.set(0.8 + r() * 0.7, h, 1)
      mtx.compose(p, q, s)
      im.setMatrixAt(n, mtx)
      c.set(greens[Math.floor(r() * greens.length)]).offsetHSL((r() - 0.5) * 0.02, 0, (r() - 0.5) * 0.06)
      im.setColorAt(n, c)
      n++
    }
    im.count = n
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    im.computeBoundingSphere()
  }, [count])

  useEffect(() => {
    uniforms.current.uWind.value = reducedMotion ? 0.3 : 1
  }, [reducedMotion])
  useEffect(() => () => {
    geo.dispose()
    mat.dispose()
  }, [geo, mat])
  useFrame((_, dt) => {
    uniforms.current.uTime.value += Math.min(dt, 0.05)
  })

  return <instancedMesh ref={mesh} args={[geo, mat, count]} receiveShadow frustumCulled={false} />
}
