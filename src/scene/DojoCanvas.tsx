/**
 * The WebGL scene host. Loaded lazily (its own chunk) so the HTML shell, loading
 * screen and fallback never wait for three.js.
 */
import * as THREE from 'three'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { camera as camCfg, quality, FLOOR_Y, type QualityPreset } from '../config/experience'
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
import { disposeRealAssets, loadRealAssets, type RealAssets } from './realAssets'
import { rememberTrigger } from '../state/hover'

/** Late-morning sun from the front right: it lights the facade and falls through the open shoji. */
const SUN: [number, number, number] = [15, 19, 13]

function Lights({ shadows, mapSize, photoSky }: { shadows: boolean; mapSize: number; photoSky: boolean }) {
  return (
    <>
      {/* with the sky photo, most fill light comes from the environment */}
      <hemisphereLight args={['#fff6ea', '#8d7458', photoSky ? 0.35 : 1.25]} />
      {!photoSky && <ambientLight intensity={0.22} color="#fff0de" />}
      <directionalLight
        position={SUN}
        intensity={photoSky ? 3.4 : 2.6}
        color={palette.sun}
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />
      {/* interior: warm lamps under the roof + a soft accent on the tokonoma */}
      <pointLight position={[0, FLOOR_Y + 3.6, -4.5]} intensity={photoSky ? 6 : 12} distance={14} decay={1.3} color={palette.lamp} />
      <pointLight position={[0, FLOOR_Y + 3.6, -10.5]} intensity={photoSky ? 8 : 14} distance={15} decay={1.3} color={palette.lamp} />
      <pointLight position={[0, FLOOR_Y + 5.6, -8]} intensity={photoSky ? 5 : 10} distance={12} decay={1.2} color="#fff4e6" />
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

/**
 * Soft shafts of sunlight entering through the two open shoji on the right wall.
 * Each shaft is the opening extruded along the sun direction down to the floor,
 * drawn additively and fading with distance.
 */
function LightShafts() {
  const { geo, mat } = useMemo(() => {
    const dir = new THREE.Vector3(...SUN).normalize().negate()
    const openings = [
      [-4.5, -3.0],
      [-10.5, -9.0],
    ]
    const y0 = FLOOR_Y + 0.92
    const y1 = FLOOR_Y + 3.12
    const x = 4.96
    const pos: number[] = []
    const fade: number[] = []
    const idx: number[] = []
    openings.forEach(([za, zb]) => {
      const quad = [
        new THREE.Vector3(x, y0, za),
        new THREE.Vector3(x, y0, zb),
        new THREE.Vector3(x, y1, zb),
        new THREE.Vector3(x, y1, za),
      ]
      const far = quad.map((p) => {
        const t = (p.y - FLOOR_Y - 0.01) / -dir.y
        return p.clone().addScaledVector(dir, t)
      })
      const base = pos.length / 3
      ;[...quad, ...far].forEach((p, i) => {
        pos.push(p.x, p.y, p.z)
        fade.push(i < 4 ? 1 : 0)
      })
      // 4 side faces of the light volume
      for (let k = 0; k < 4; k++) {
        const a = base + k
        const b = base + ((k + 1) % 4)
        idx.push(a, b, b + 4, a, b + 4, a + 4)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('fade', new THREE.Float32BufferAttribute(fade, 1))
    g.setIndex(idx)
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#ffe9c8') }, uStrength: { value: 0.06 } },
      vertexShader: 'attribute float fade; varying float vFade; void main(){ vFade = fade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 uColor; uniform float uStrength; varying float vFade; void main(){ gl_FragColor = vec4(uColor * uStrength * (0.25 + 0.75 * vFade), 1.0); }',
    })
    return { geo: g, mat: m }
  }, [])
  useEffect(() => () => {
    geo.dispose()
    mat.dispose()
  }, [geo, mat])
  return <mesh geometry={geo} material={mat} renderOrder={5} frustumCulled={false} />
}

/** Applies the sky photo as environment lighting and as a soft, blurred background. */
function SkyEnvironment({ env }: { env: THREE.Texture | null }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    if (!env) return
    const prevBg = scene.background
    scene.environment = env
    scene.environmentIntensity = 0.75
    scene.background = env
    scene.backgroundBlurriness = 0.12
    scene.backgroundIntensity = 0.95
    return () => {
      scene.environment = null
      scene.background = prevBg
    }
  }, [env, scene])
  return null
}

/** Loads the photographic textures + sky (non-blocking; failures fall back silently). */
function useRealAssets(preset: QualityPreset) {
  const gl = useThree((s) => s.gl)
  const [assets, setAssets] = useState<RealAssets | null | 'loading'>('loading')
  useEffect(() => {
    let alive = true
    let loaded: RealAssets | null = null
    loadRealAssets(gl, { normals: preset.normals, anisotropy: Math.min(8, gl.capabilities.getMaxAnisotropy()) })
      .then((a) => {
        loaded = a
        if (alive) setAssets(a)
        else disposeRealAssets(a)
      })
      .catch(() => alive && setAssets(null))
    return () => {
      alive = false
      disposeRealAssets(loaded)
    }
  }, [gl, preset.normals])
  return assets
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

function Finish({ post }: { post: QualityPreset['post'] }) {
  if (post === 'none') return null
  const full = post === 'full'
  return (
    <EffectComposer multisampling={full ? 4 : 0}>
      <N8AO aoRadius={1.2} distanceFalloff={0.8} intensity={full ? 2.4 : 2} halfRes={!full} quality={full ? 'medium' : 'performance'} />
      <Bloom mipmapBlur intensity={0.32} luminanceThreshold={0.86} luminanceSmoothing={0.25} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.3} darkness={0.38} />
    </EffectComposer>
  )
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
        gl={{ antialias: preset.post === 'none' && preset.antialias, powerPreference: 'high-performance', alpha: false, stencil: false }}
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
        <PerformanceMonitor
          onDecline={() => setDprFactor((f) => Math.max(0.6, f - 0.15))}
          onIncline={() => setDprFactor((f) => Math.min(1, f + 0.1))}
          flipflops={4}
          onFallback={() => setDprFactor(0.6)}
        />
        <CameraRig />
        <Scene tx={tx} preset={preset} reducedMotion={reducedMotion} interactive={interactive} onSelect={onSelect} onReady={onReady} />
        <HotspotProjector />
      </Canvas>
      <HotspotLayer lang={route.lang} visible={interactive} interactive={interactive} onSelect={onSelect} />
    </>
  )
}

function Scene({
  tx,
  preset,
  reducedMotion,
  interactive,
  onSelect,
  onReady,
}: {
  tx: TextureSet
  preset: QualityPreset
  reducedMotion: boolean
  interactive: boolean
  onSelect: (id: SectionId) => void
  onReady: () => void
}) {
  const assets = useRealAssets(preset)
  const real = assets === 'loading' ? null : assets
  const m = useCreateMaterials(tx, real)
  const photoSky = Boolean(real?.env)
  // hold the loading screen until the photographic textures are in (or have failed)
  if (assets === 'loading') return null
  return (
    <MaterialsContext.Provider value={{ m, tx }}>
      <fog attach="fog" args={[photoSky ? '#e9e4dc' : '#efe5da', 38, 150]} />
      <SkyEnvironment env={real?.env ?? null} />
      <Lights shadows={preset.shadows} mapSize={preset.shadowMapSize} photoSky={photoSky} />
      <Garden blossoms={preset.blossoms} grass={preset.grass} reducedMotion={reducedMotion} photoSky={photoSky} />
      <Building />
      <Doors />
      <DojoObjects interactive={interactive} onSelect={onSelect} />
      <Petals count={preset.petals} reducedMotion={reducedMotion} />
      {photoSky && <LightShafts />}
      <Finish post={preset.post} />
      <ReadySignal onReady={onReady} />
    </MaterialsContext.Provider>
  )
}
