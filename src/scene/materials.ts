/**
 * Scene materials. Geometry UVs are in metres (see worldBox / worldPlane), so each
 * material sets how many metres one texture tile covers.
 * Photographic textures are used when loaded; otherwise the drawn canvas textures.
 */
import * as THREE from 'three'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { palette } from '../config/theme'
import type { TextureSet } from './textures'
import { tiled, type PbrSet, type RealAssets } from './realAssets'

/** A procedural texture re-tiled in metres */
function drawn(t: THREE.Texture, metres: number, rotation = 0): PbrSet {
  const n = t.clone()
  n.wrapS = n.wrapT = THREE.RepeatWrapping
  n.repeat.set(1 / metres, 1 / metres)
  n.rotation = rotation
  n.needsUpdate = true
  return { map: n }
}

export function createMaterials(tx: TextureSet, real: RealAssets | null) {
  const pbr = real?.pbr ?? {}
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...p })
  /** Material from a texture set + tint; roughness map (if any) is multiplied by `roughness`. */
  const surface = (set: PbrSet | undefined, p: THREE.MeshStandardMaterialParameters) =>
    std({ map: set?.map ?? null, normalMap: set?.normalMap ?? null, roughnessMap: set?.roughnessMap ?? null, normalScale: new THREE.Vector2(0.8, 0.8), ...p })

  const hinoki = (m: number, r = 0) => tiled(pbr.hinoki, m, r) ?? drawn(tx.floor, m * 2, r)
  const cedar = (m: number, r = 0) => tiled(pbr.cedar, m, r) ?? drawn(tx.post, m)
  const plaster = (m: number) => tiled(pbr.plaster, m) ?? drawn(tx.plaster, m)

  const real_ = Boolean(real?.env)
  // shoji panels are 1.46 m × 2.25 m and the paper texture covers exactly one panel
  const shojiTex = tx.shoji.clone()
  shojiTex.wrapS = shojiTex.wrapT = THREE.RepeatWrapping
  shojiTex.repeat.set(1 / 1.46, 1 / 2.25)
  shojiTex.needsUpdate = true
  return {
    // pale hinoki boards, planks running down the length of the room
    floor: surface(hinoki(2.4, Math.PI / 2), { color: pbr.hinoki ? '#efe2d0' : '#f4ebe0', roughness: pbr.hinoki ? 0.55 : 0.5, envMapIntensity: 0.9 }),
    beam: surface(cedar(2.2), { color: pbr.cedar ? '#8a7363' : '#e9ddd0', roughness: 0.75 }),
    post: surface(cedar(1.8), { color: pbr.cedar ? '#8a6650' : '#cdb8a3', roughness: 0.7 }),
    plaster: surface(plaster(2.5), { color: pbr.plaster ? '#fbf1e2' : '#ffffff', roughness: 0.95, envMapIntensity: 0.6, normalScale: new THREE.Vector2(0.3, 0.3) }),
    wainscot: surface(cedar(1.6, Math.PI / 2), { color: pbr.cedar ? '#b48b6b' : '#d6c7b8', roughness: 0.65 }),
    shoji: std({ map: shojiTex, emissive: new THREE.Color('#fff4e2'), emissiveIntensity: real_ ? 0.75 : 0.55, emissiveMap: shojiTex, roughness: 1 }),
    roofTop: surface(tiled(pbr.roof, 2.2) ?? drawn(tx.roof, 3), { color: pbr.roof ? '#b9b7b3' : '#c9c6c2', roughness: 0.75 }),
    roofUnder: surface(cedar(2.5, Math.PI / 2), { color: pbr.cedar ? '#c2ab98' : '#e8dccd', roughness: 0.8, envMapIntensity: 0.4 }),
    fascia: surface(cedar(2), { color: pbr.cedar ? '#4a3326' : palette.woodDark, roughness: 0.7 }),
    stoneBase: surface(tiled(pbr.stone, 1.6), { color: pbr.stone ? '#c9c4bc' : '#9d958a', roughness: 1 }),
    stone: surface(tiled(pbr.stone, 1.2), { color: pbr.stone ? '#d8d3ca' : palette.stone, roughness: 1 }),
    stoneDark: surface(tiled(pbr.stone, 1.2), { color: pbr.stone ? '#a9a39a' : '#8a8378', roughness: 1 }),
    gravel: surface(tiled(pbr.gravel, 1.1) ?? drawn(tx.gravel, 1.2), { color: pbr.gravel ? '#c4beb4' : '#ffffff', roughness: 1 }),
    grass: surface(tiled(pbr.grass, 3.5) ?? drawn(tx.grass, 6), { color: pbr.grass ? '#b9c991' : '#ffffff', roughness: 1 }),
    hedge: surface(tiled(pbr.grass, 0.7), { color: pbr.grass ? '#5c7040' : '#55663b', roughness: 1 }),
    hedgeLight: surface(tiled(pbr.grass, 0.7), { color: pbr.grass ? '#73864c' : '#6a7c48', roughness: 1 }),
    bark: surface(tiled(pbr.bark, 1.2), { color: pbr.bark ? '#8f7c70' : '#4b362a', roughness: 0.95 }),
    door: std({ map: tx.door, roughness: 0.65 }),
    darkWood: surface(cedar(1.5), { color: pbr.cedar ? '#3e2b20' : '#3f2a1d', roughness: 0.55 }),
    deck: surface(cedar(1.8, Math.PI / 2), { color: pbr.cedar ? '#a98468' : '#e3c9a6', roughness: 0.6 }),
    paper: std({ color: '#f4ecdc', roughness: 1 }),
    lanternGlow: std({ color: '#fff0d6', emissive: new THREE.Color(palette.lamp), emissiveIntensity: 1.6 }),
    hills: std({ color: '#b9bba4', roughness: 1 }),
    hillsFar: std({ color: '#cfd1c2', roughness: 1 }),
    bamboo: std({ color: '#b5a171', roughness: 0.6 }),
    rope: std({ color: '#cbb795', roughness: 1 }),
    vase: std({ color: '#2f3a3a', roughness: 0.25, metalness: 0.1 }),
  }
}

export type Materials = ReturnType<typeof createMaterials>

export function useCreateMaterials(tx: TextureSet, real: RealAssets | null) {
  const mats = useMemo(() => createMaterials(tx, real), [tx, real])
  useEffect(
    () => () =>
      Object.values(mats).forEach((m) => {
        // the re-tiled clones belong to these materials
        ;[m.normalMap, m.roughnessMap, m.map !== m.emissiveMap ? m.map : null].forEach((t) => t?.dispose())
        m.dispose()
      }),
    [mats],
  )
  return mats
}

export const MaterialsContext = createContext<{ m: Materials; tx: TextureSet } | null>(null)
export function useMaterials() {
  const ctx = useContext(MaterialsContext)
  if (!ctx) throw new Error('MaterialsContext missing')
  return ctx
}
