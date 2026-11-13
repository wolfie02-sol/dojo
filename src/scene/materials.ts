import * as THREE from 'three'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { palette } from '../config/theme'
import type { TextureSet } from './textures'

export function createMaterials(tx: TextureSet) {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...p })
  return {
    floor: std({ map: tx.floor, roughness: 0.5, color: '#f4ebe0' }),
    beam: std({ map: tx.beam, color: '#e9ddd0' }),
    post: std({ map: tx.post, color: '#cdb8a3' }),
    plaster: std({ map: tx.plaster, roughness: 0.95 }),
    wainscot: std({ map: tx.post, color: '#d6c7b8' }),
    shoji: std({ map: tx.shoji, emissive: new THREE.Color('#fff4e2'), emissiveIntensity: 0.55, emissiveMap: tx.shoji, roughness: 1 }),
    roofTop: std({ map: tx.roof, roughness: 0.7, color: '#c9c6c2' }),
    roofUnder: std({ map: tx.floor, color: '#e8dccd' }),
    fascia: std({ color: palette.woodDark, roughness: 0.8 }),
    stoneBase: std({ color: '#9d958a', roughness: 1 }),
    stone: std({ color: palette.stone, roughness: 1 }),
    stoneDark: std({ color: '#8a8378', roughness: 1 }),
    gravel: std({ map: tx.gravel, roughness: 1 }),
    grass: std({ map: tx.grass, roughness: 1 }),
    hedge: std({ color: '#5f6e45', roughness: 1 }),
    hedgeLight: std({ color: '#74845a', roughness: 1 }),
    bark: std({ color: '#4b362a', roughness: 1 }),
    door: std({ map: tx.door, roughness: 0.75 }),
    darkWood: std({ color: '#3f2a1d', roughness: 0.6 }),
    deck: std({ map: tx.post, color: '#e3c9a6', roughness: 0.7 }),
    paper: std({ color: '#f4ecdc', roughness: 1 }),
    lanternGlow: std({ color: '#fff0d6', emissive: new THREE.Color(palette.lamp), emissiveIntensity: 1.2 }),
    hills: std({ color: '#b9bba4', roughness: 1 }),
    hillsFar: std({ color: '#cfd1c2', roughness: 1 }),
    bamboo: std({ color: '#b5a171', roughness: 0.8 }),
    rope: std({ color: '#cbb795', roughness: 1 }),
    vase: std({ color: '#2f3a3a', roughness: 0.35 }),
  }
}

export type Materials = ReturnType<typeof createMaterials>

export function useCreateMaterials(tx: TextureSet) {
  const mats = useMemo(() => createMaterials(tx), [tx])
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  return mats
}

export const MaterialsContext = createContext<{ m: Materials; tx: TextureSet } | null>(null)
export function useMaterials() {
  const ctx = useContext(MaterialsContext)
  if (!ctx) throw new Error('MaterialsContext missing')
  return ctx
}
