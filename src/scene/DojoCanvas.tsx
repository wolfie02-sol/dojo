/**
 * The WebGL scene host. Loaded lazily (its own chunk) so the HTML shell, loading
 * screen and fallback never wait for three.js.
 */
import * as THREE from 'three'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { camera as camCfg, quality, FLOOR_Y } from '../config/experience'
import { dojo } from '../config/content'
import type { SectionId } from '../config/site'
import { palette } from '../config/theme'
import { detectQuality } from '../lib/device'
import { useExperience } from '../state/ExperienceContext'
import { navigate, useRoute } from '../router/router'
import { CameraRig } from './CameraRig'
import { director } from './director'
import { Building } from './Building'
import { Doors } from './Doors'
import { Garden } from './Garden'
import { DojoObjects } from './DojoObjects'
import { Petals } from './Petals'
import { HotspotLayer, HotspotProjector } from './Hotspots'
import { MaterialsContext, useCreateMaterials } from './materials'
import { createTextures, disposeTextures, loadBrushFont, type TextureSet } from './textures'
import { rememberTrigger } from '../state/hover'

function Lights({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  return (
    <>
      <hemisphereLight args={['#fff6ea', '#9b7d5f', 1.25]} />
      <ambientLight intensity={0.22} color="#fff0de" />
      <directionalLight
        position={[-14, 24, 20]}
        intensity={2.6}
        color={palette.sun}
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      {/* interior: warm lamps under the roof + a soft accent on the tokonoma */}
      <pointLight position={[0, FLOOR_Y + 3.6, -4.5]} intensity={12} distance={14} decay={1.3} color={palette.lamp} />
      <pointLight position={[0, FLOOR_Y + 3.6, -10.5]} intensity={14} distance={15} decay={1.3} color={palette.lamp} />
      <pointLight position={[0, FLOOR_Y + 5.6, -8]} intensity={10} distance={12} decay={1.2} color="#fff4e6" />
      <pointLight position={[3.2, FLOOR_Y + 2.4, -9.8]} intensity={4} distance={7} decay={1.5} color="#fff7ec" />
      <SpotOnScroll />
    </>
  )
}

function SpotOnScroll() {
  const [target] = useState(() => {
    const o = new THREE.Object3D()
    o.position.set(0, 2.5, -15)
    return o
  })
  return (
    <>
      <primitive object={target} />
      <spotLight position={[0, FLOOR_Y + 3.9, -10]} target={target} angle={0.32} penumbra={0.9} intensity={22} distance={9} decay={1.2} color="#ffe7c8" />
    </>
  )
}

/** Signals readiness after the first few frames have actually rendered */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current >= 3) {
      done.current = true
      onReady()
    }
  })
  return null
}

export default function DojoCanvas() {
  const { state, dispatch, reducedMotion } = useExperience()
  const route = useRoute()
  const [tier] = useState(detectQuality)
  const preset = quality[tier]
  const [tx, setTx] = useState<TextureSet | null>(null)
  const [hidden, setHidden] = useState(() => document.hidden)
  const [dprFactor, setDprFactor] = useState(1)

  useEffect(() => {
    let alive = true
    loadBrushFont(dojo.calligraphy + dojo.entranceSign + '有段者稽古暦').then(() => {
      if (alive) setTx(createTextures(preset.textureSize, dojo.calligraphy, dojo.entranceSign))
    })
    return () => {
      alive = false
    }
  }, [preset.textureSize])
  useEffect(() => () => disposeTextures(tx), [tx])

  // Pause rendering entirely while the tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) director.notifyResume()
      setHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const onReady = useCallback(() => dispatch({ type: 'SCENE_READY', direct: route.section !== null }), [dispatch, route.section])
  const onSelect = useCallback((id: SectionId) => navigate({ lang: route.lang, section: id }), [route.lang])

  if (!tx) return null

  const interior = state.phase === 'interior'
  const interactive = interior && state.settled && route.section === null
  const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, preset.maxDpr) * dprFactor)

  return (
    <>
    <Canvas
      className="scene__canvas"
      frameloop={hidden ? 'never' : 'always'}
      dpr={dpr}
      shadows={preset.shadows ? 'percentage' : false}
      gl={{ antialias: preset.antialias, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: camCfg.fov, near: camCfg.near, far: camCfg.far, position: camCfg.exterior.position }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 0.95
        gl.outputColorSpace = THREE.SRGBColorSpace
        scene.background = new THREE.Color(palette.sky)
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          dispatch({ type: 'SCENE_FAILED', reason: 'context-lost' })
        })
      }}
      onPointerMissed={() => rememberTrigger(null)}
    >
      <fog attach="fog" args={['#efe5da', 30, 125]} />
      <PerformanceMonitor
        onDecline={() => setDprFactor((f) => Math.max(0.6, f - 0.15))}
        onIncline={() => setDprFactor((f) => Math.min(1, f + 0.1))}
        flipflops={4}
        onFallback={() => setDprFactor(0.6)}
      />
      <CameraRig />
      <Scene tx={tx} preset={preset} reducedMotion={reducedMotion} interactive={interactive} onSelect={onSelect} />
      <HotspotProjector />
      <ReadySignal onReady={onReady} />
    </Canvas>
    <HotspotLayer lang={route.lang} visible={interactive} interactive={interactive} onSelect={onSelect} />
    </>
  )
}

function Scene({ tx, preset, reducedMotion, interactive, onSelect }: { tx: TextureSet; preset: (typeof quality)['high']; reducedMotion: boolean; interactive: boolean; onSelect: (id: SectionId) => void }) {
  const m = useCreateMaterials(tx)
  return (
    <MaterialsContext.Provider value={{ m, tx }}>
      <Lights shadows={preset.shadows} mapSize={preset.shadowMapSize} />
      <Garden blossoms={preset.blossoms} reducedMotion={reducedMotion} />
      <Building />
      <Doors />
      <DojoObjects interactive={interactive} onSelect={onSelect} />
      <Petals count={preset.petals} reducedMotion={reducedMotion} />
    </MaterialsContext.Provider>
  )
}
