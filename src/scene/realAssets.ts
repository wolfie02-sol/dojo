/**
 * Photographic materials (CC0, Poly Haven — see ASSETS.md) and the sky used for lighting.
 *
 * Every file is optional: if one fails to load, the material falls back to the
 * procedural canvas texture, so a missing file never breaks the scene.
 */
import * as THREE from 'three'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'

const url = (p: string) => `${import.meta.env.BASE_URL}${p}`

export const PBR_SETS = {
  hinoki: 'hinoki_planks',
  cedar: 'japanese_cedar_planks',
  plaster: 'clay_plaster',
  roof: 'grey_roof_tiles',
  bark: 'sakura_bark',
  gravel: 'flower_scattered_gravel',
  grass: 'leafy_grass',
  stone: 'japanese_stone_wall',
} as const
export type PbrKey = keyof typeof PBR_SETS

export interface PbrSet {
  map: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
}

export interface RealAssets {
  pbr: Partial<Record<PbrKey, PbrSet>>
  /** Pre-filtered environment for image-based lighting (and the blurred background) */
  env: THREE.Texture | null
}

const SKY = 'hdr/bryanston_park_sunrise_1k.hdr'

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

export async function loadRealAssets(gl: THREE.WebGLRenderer, opts: { normals: boolean; anisotropy: number }): Promise<RealAssets> {
  const loader = new THREE.TextureLoader()
  const load = async (path: string, color: boolean) => {
    try {
      const t = await withTimeout(loader.loadAsync(url(path)), 20000)
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = opts.anisotropy
      if (color) t.colorSpace = THREE.SRGBColorSpace
      return t
    } catch {
      console.warn(`[dojo] texture not loaded, using the drawn version: ${path}`)
      return undefined
    }
  }

  const sets = await Promise.all(
    (Object.keys(PBR_SETS) as PbrKey[]).map(async (key) => {
      const base = `textures/${PBR_SETS[key]}`
      const [map, normalMap, roughnessMap] = await Promise.all([
        load(`${base}_diff.webp`, true),
        opts.normals ? load(`${base}_nor.webp`, false) : Promise.resolve(undefined),
        load(`${base}_rough.webp`, false),
      ])
      return [key, map ? { map, normalMap, roughnessMap } : undefined] as const
    }),
  )
  const pbr: RealAssets['pbr'] = {}
  for (const [k, v] of sets) if (v) pbr[k] = v

  let env: THREE.Texture | null = null
  try {
    const hdr = await withTimeout(new HDRLoader().loadAsync(url(SKY)), 25000)
    hdr.mapping = THREE.EquirectangularReflectionMapping
    const pmrem = new THREE.PMREMGenerator(gl)
    env = pmrem.fromEquirectangular(hdr).texture
    hdr.dispose()
    pmrem.dispose()
  } catch {
    console.warn('[dojo] sky lighting not loaded, using simple lights')
  }
  return { pbr, env }
}

export function disposeRealAssets(a: RealAssets | null) {
  if (!a) return
  Object.values(a.pbr).forEach((s) => {
    s?.map.dispose()
    s?.normalMap?.dispose()
    s?.roughnessMap?.dispose()
  })
  a.env?.dispose()
}

/**
 * Box geometry whose UVs are in metres, so a texture keeps the same real-world size
 * on every wall, beam and slab (set `material.map.repeat` to 1 / tile size).
 */
export function worldBox(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv as THREE.BufferAttribute
  // face order: +x, -x, +y, -y, +z, -z (4 vertices each)
  const spans: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ]
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * spans[f][0], uv.getY(i) * spans[f][1])
    }
  }
  return g
}

/** Clone a texture set with its own tiling (images are shared, uploaded once). */
export function tiled(set: PbrSet | undefined, metresPerTile: number, rotation = 0): PbrSet | undefined {
  if (!set) return undefined
  const c = (t?: THREE.Texture) => {
    if (!t) return undefined
    const n = t.clone()
    n.repeat.set(1 / metresPerTile, 1 / metresPerTile)
    n.rotation = rotation
    n.needsUpdate = true
    return n
  }
  return { map: c(set.map)!, normalMap: c(set.normalMap), roughnessMap: c(set.roughnessMap) }
}

/** Plane geometry with UVs in metres */
export function worldPlane(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h)
  const uv = g.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h)
  return g
}
