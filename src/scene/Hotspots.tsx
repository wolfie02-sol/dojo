/**
 * Accessible hotspots: real HTML <button>s that live in the normal page (keyboard,
 * screen readers and one-tap touch all just work) and are pinned to the 3D objects.
 *
 *  - <HotspotLayer> renders the buttons (outside the <Canvas>).
 *  - <HotspotProjector> runs inside the <Canvas> and, every frame, projects each
 *    object's anchor to screen coordinates and moves its button there.
 */
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { hotspots } from '../config/experience'
import { SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'
import { rememberTrigger, setHovered, takePendingHotspotFocus, useHovered } from '../state/hover'
import { director } from './director'

const anchors = Object.fromEntries(
  SECTION_IDS.map((id) => {
    const h = hotspots[id]
    const offset = new THREE.Vector3(...h.labelOffset).applyAxisAngle(THREE.Object3D.DEFAULT_UP, h.rotationY)
    return [id, new THREE.Vector3(...h.position).add(offset)]
  }),
) as Record<SectionId, THREE.Vector3>

const elements = new Map<SectionId, HTMLElement>()

export function HotspotProjector() {
  const v = useRef(new THREE.Vector3())
  useFrame(({ camera, size }) => {
    for (const id of SECTION_IDS) {
      const el = elements.get(id)
      if (!el) continue
      v.current.copy(anchors[id]).project(camera)
      const behind = v.current.z > 1
      const x = (v.current.x * 0.5 + 0.5) * size.width
      const y = (-v.current.y * 0.5 + 0.5) * size.height
      // the ring sits exactly on the pin; the label hangs below or above it
      const shift = hotspots[id].placement === 'above' ? 'calc(-100% + 14px)' : '-14px'
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, ${shift})`
      el.style.visibility = behind ? 'hidden' : ''
    }
  })
  return null
}

export function HotspotLayer({ lang, visible, interactive, onSelect }: { lang: Lang; visible: boolean; interactive: boolean; onSelect: (id: SectionId) => void }) {
  const hovered = useHovered()
  // Return focus to the hotspot that opened the last section, once it is interactive again
  useEffect(() => {
    if (!interactive) return
    const el = takePendingHotspotFocus()
    if (el && document.activeElement === document.getElementById('main')) requestAnimationFrame(() => el.focus({ preventScroll: true }))
  }, [interactive])
  return (
    <div className="hotspots" aria-hidden={!visible} inert={!interactive}>
      {SECTION_IDS.map((id, i) => {
        const meta = SECTIONS[id]
        return (
          <button
            key={id}
            ref={(el) => {
              if (el) elements.set(id, el)
              else elements.delete(id)
            }}
            type="button"
            className={`hotspot hotspot--${hotspots[id].placement}${visible ? ' is-visible' : ''}${hovered === id ? ' is-active' : ''}`}
            style={{ transitionDelay: visible ? `${150 + i * 70}ms` : '0ms' }}
            data-section={id}
            tabIndex={interactive ? 0 : -1}
            onClick={(e) => {
              rememberTrigger(e.currentTarget)
              onSelect(id)
            }}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(null)}
            onFocus={() => {
              setHovered(id)
              director.lookToward(new THREE.Vector3(...hotspots[id].position))
            }}
            onBlur={() => setHovered(null)}
          >
            <span className="hotspot__ring" aria-hidden="true" />
            <span className="hotspot__text">
              <span className="hotspot__label">{meta.label[lang]}</span>
              <span className="hotspot__hint">{meta.hint[lang]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
