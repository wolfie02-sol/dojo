/**
 * Which dojo object is highlighted (hover / keyboard focus). A tiny external store so
 * the 3D objects can read it every frame without re-rendering React trees.
 */
import { useSyncExternalStore } from 'react'
import type { SectionId } from '../config/site'

let hovered: SectionId | null = null
const listeners = new Set<() => void>()

export function setHovered(id: SectionId | null) {
  if (hovered === id) return
  hovered = id
  listeners.forEach((l) => l())
}
export function getHovered() {
  return hovered
}
export function useHovered() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => hovered,
  )
}

/** Remembers which control opened a section so focus can return there on close. */
let lastTrigger: HTMLElement | null = null
export function rememberTrigger(el: HTMLElement | null) {
  lastTrigger = el
}
export function takeTrigger(): HTMLElement | null {
  const el = lastTrigger
  lastTrigger = null
  return el && document.contains(el) ? el : null
}

/** A hotspot waiting to receive focus once the camera has settled (hotspots are inert while it moves). */
let pendingHotspotFocus: HTMLElement | null = null
export function setPendingHotspotFocus(el: HTMLElement | null) {
  pendingHotspotFocus = el
}
export function takePendingHotspotFocus() {
  const el = pendingHotspotFocus
  pendingHotspotFocus = null
  return el
}
