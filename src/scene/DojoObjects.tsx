/**
 * The seven interactive objects (one per section). Placement comes from
 * `hotspots` in src/config/experience.ts. Each object glows softly when its
 * hotspot is hovered or focused, and can be clicked/tapped directly too.
 */
import * as THREE from 'three'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { hotspots } from '../config/experience'
import type { SectionId } from '../config/site'
import { getHovered, setHovered } from '../state/hover'
import { useMaterials } from './materials'
import { FLOOR_Y } from '../config/experience'

/** A material whose emissive glow follows the hover state of one section */
function useGlowMaterial(id: SectionId, params: THREE.MeshStandardMaterialParameters, glow = '#ffd9c2') {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8, ...params, emissive: new THREE.Color(glow), emissiveIntensity: 0 }), [])
  useEffect(() => () => mat.dispose(), [mat])
  const base = (params.emissiveIntensity as number | undefined) ?? 0
  useFrame((_, dt) => {
    const target = getHovered() === id ? 0.38 : base
    mat.emissiveIntensity += (target - mat.emissiveIntensity) * (1 - Math.exp(-Math.min(dt, 0.05) * 10))
  })
  return mat
}

interface ObjProps {
  id: SectionId
  interactive: boolean
  onSelect: (id: SectionId) => void
  children: ReactNode
}

/** Wraps an object: placement + pointer handling (clicks are ignored while not interactive). */
function Placed({ id, interactive, onSelect, children }: ObjProps) {
  const p = hotspots[id]
  const down = useRef<{ x: number; y: number } | null>(null)
  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          if (e.pointerType !== 'mouse') return
          setHovered(id)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          if (getHovered() === id) setHovered(null)
          document.body.style.cursor = ''
        },
        onPointerDown: (e: ThreeEvent<PointerEvent>) => {
          down.current = { x: e.clientX, y: e.clientY }
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          // ignore the end of a look-around drag
          if (down.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 8) return
          onSelect(id)
        },
      }
    : {}
  useEffect(() => {
    if (!interactive) document.body.style.cursor = ''
  }, [interactive])
  return (
    <group position={p.position} rotation={[0, p.rotationY, 0]} {...handlers}>
      {children}
    </group>
  )
}

function Scroll(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const paper = useGlowMaterial(props.id, { map: tx.scroll, roughness: 0.95 })
  return (
    <Placed {...props}>
      <mesh material={paper} position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.72, 2.05, 0.012]} />
      </mesh>
      {/* silk mounting */}
      <mesh position={[0, 0, 0.01]} material={m.fascia}>
        <boxGeometry args={[0.84, 2.3, 0.008]} />
      </mesh>
      {[1.17, -1.19].map((y) => (
        <mesh key={y} position={[0, y, 0.04]} rotation={[0, 0, Math.PI / 2]} material={m.darkWood}>
          <cylinderGeometry args={[0.025, 0.025, y > 0 ? 0.92 : 1.0, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 1.42, 0.02]} material={m.rope}>
        <boxGeometry args={[0.012, 0.5, 0.01]} />
      </mesh>
    </Placed>
  )
}

function SenseiFrame(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const photo = useGlowMaterial(props.id, { map: tx.portrait, roughness: 0.7 })
  return (
    <Placed {...props}>
      <mesh position={[0, 0, 0.03]} material={m.darkWood} castShadow>
        <boxGeometry args={[1.0, 1.24, 0.06]} />
      </mesh>
      <mesh position={[0, 0, 0.035]} material={m.paper}>
        <boxGeometry args={[0.86, 1.1, 0.06]} />
      </mesh>
      <mesh position={[0, 0.02, 0.07]} material={photo}>
        <planeGeometry args={[0.62, 0.78]} />
      </mesh>
      {/* small shelf with an offering below the portrait */}
      <mesh position={[0, -0.82, 0.14]} material={m.darkWood} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.26]} />
      </mesh>
    </Placed>
  )
}

function NameBoard(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const board = useGlowMaterial(props.id, { map: tx.names, roughness: 0.6 })
  return (
    <Placed {...props}>
      <mesh position={[0, 0, 0.035]} material={board} castShadow>
        <boxGeometry args={[2.1, 1.3, 0.05]} />
      </mesh>
      <mesh position={[0, 0.7, 0.06]} material={m.darkWood} castShadow>
        <boxGeometry args={[2.3, 0.1, 0.1]} />
      </mesh>
    </Placed>
  )
}

function ScheduleBoard(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const board = useGlowMaterial(props.id, { map: tx.schedule, roughness: 0.7 })
  return (
    <Placed {...props}>
      <mesh position={[0, 0, 0.03]} material={board} castShadow>
        <boxGeometry args={[1.6, 1.12, 0.04]} />
      </mesh>
      <mesh position={[0, 0.6, 0.05]} material={m.darkWood}>
        <boxGeometry args={[1.75, 0.08, 0.08]} />
      </mesh>
    </Placed>
  )
}

function CalendarSheet(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const sheet = useGlowMaterial(props.id, { map: tx.calendar, roughness: 0.95 })
  return (
    <Placed {...props}>
      <mesh position={[0, 0, 0.02]} material={sheet} castShadow>
        <boxGeometry args={[0.95, 1.32, 0.01]} />
      </mesh>
      <mesh position={[0, 0.68, 0.04]} rotation={[0, 0, Math.PI / 2]} material={m.darkWood}>
        <cylinderGeometry args={[0.022, 0.022, 1.05, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.22, 0.86, 0.03]} rotation={[0, 0, s * 0.9]} material={m.rope}>
          <boxGeometry args={[0.01, 0.42, 0.01]} />
        </mesh>
      ))}
    </Placed>
  )
}

function EmaRack(props: Omit<ObjProps, 'children'>) {
  const { m, tx } = useMaterials()
  const ema = useGlowMaterial(props.id, { map: tx.ema, roughness: 0.75 })
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.13, -0.1)
    s.lineTo(0.13, -0.1)
    s.lineTo(0.13, 0.06)
    s.lineTo(0, 0.12)
    s.lineTo(-0.13, 0.06)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.015, bevelEnabled: false })
    // map UVs to the 0..1 square
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 0.13) / 0.26, (uv.getY(i) + 0.1) / 0.22)
    return g
  }, [])
  useEffect(() => () => shape.dispose(), [shape])
  const tablets = [
    [-0.55, 0.2], [-0.27, 0.15], [0.02, 0.21], [0.3, 0.14], [0.57, 0.2],
    [-0.42, -0.2], [-0.12, -0.24], [0.17, -0.19], [0.45, -0.25],
  ]
  return (
    <Placed {...props}>
      <mesh position={[0, 0, 0.02]} material={m.post} castShadow>
        <boxGeometry args={[1.5, 1.1, 0.04]} />
      </mesh>
      {[0.36, -0.04].map((y) => (
        <mesh key={y} position={[0, y, 0.08]} rotation={[0, 0, Math.PI / 2]} material={m.darkWood}>
          <cylinderGeometry args={[0.018, 0.018, 1.4, 8]} />
        </mesh>
      ))}
      {tablets.map(([x, y], i) => (
        <mesh key={i} geometry={shape} material={ema} position={[x, y, 0.07]} rotation={[0.05, 0, (i % 3) * 0.04 - 0.04]} castShadow />
      ))}
      <mesh position={[0, 0.6, 0.05]} material={m.darkWood}>
        <boxGeometry args={[1.62, 0.1, 0.1]} />
      </mesh>
    </Placed>
  )
}

/** Contact: the open shoji onto the garden, with a small lantern (andon) marking the threshold */
function GardenOpening(props: Omit<ObjProps, 'children'>) {
  const { m } = useMaterials()
  const frame = useGlowMaterial(props.id, { color: '#5a3a26', roughness: 0.6 })
  const lamp = useGlowMaterial(props.id, { color: '#fff3dc', emissiveIntensity: 0.25 }, '#ffcf96')
  return (
    <Placed {...props}>
      {/* opening frame — local x runs along the wall, the room is at +z */}
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0, 0.02]} material={frame}>
          <boxGeometry args={[0.05, 2.25, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, 1.12, 0.02]} material={frame}>
        <boxGeometry args={[1.55, 0.05, 0.08]} />
      </mesh>
      {/* andon floor lantern just inside */}
      <group position={[0.55, FLOOR_Y - 2.475, 0.42]}>
        <mesh position={[0, 0.28, 0]} material={lamp}>
          <boxGeometry args={[0.22, 0.4, 0.22]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={m.darkWood}>
          <boxGeometry args={[0.26, 0.06, 0.26]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} material={m.darkWood}>
          <boxGeometry args={[0.26, 0.04, 0.26]} />
        </mesh>
      </group>
    </Placed>
  )
}

export function DojoObjects({ interactive, onSelect }: { interactive: boolean; onSelect: (id: SectionId) => void }) {
  const p = { interactive, onSelect }
  return (
    <group>
      <Scroll id="about" {...p} />
      <SenseiFrame id="sensei" {...p} />
      <NameBoard id="blackBelts" {...p} />
      <ScheduleBoard id="schedule" {...p} />
      <EmaRack id="links" {...p} />
      <CalendarSheet id="calendar" {...p} />
      <GardenOpening id="contact" {...p} />
    </group>
  )
}
