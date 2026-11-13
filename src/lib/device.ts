import type { QualityTier } from '../config/experience'

const params = new URLSearchParams(window.location.search)

/** `?webgl=0` forces the HTML fallback (useful for testing). */
export function webglAvailable(): boolean {
  if (params.get('webgl') === '0') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * Picks a starting quality tier from device hints. The scene also steps
 * down at runtime if the frame rate drops (see PerformanceMonitor in DojoCanvas).
 * `?quality=low|medium|high` overrides it.
 */
export function detectQuality(): QualityTier {
  const forced = params.get('quality')
  if (forced === 'low' || forced === 'medium' || forced === 'high') return forced

  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = matchMedia('(pointer: coarse)').matches
  const small = Math.min(screen.width, screen.height) < 820

  let renderer = ''
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    if (gl && info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).toLowerCase()
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    /* ignore */
  }
  if (/swiftshader|llvmpipe|software|basic render/.test(renderer)) return 'low'
  // iPhones/iPads hide their specs but have capable GPUs
  if (/iPhone|iPad|Macintosh/.test(navigator.userAgent) && coarse) return 'medium'
  if (coarse && small) return cores >= 8 && memory >= 6 ? 'medium' : 'low'
  if (cores <= 4 || memory <= 4) return 'medium'
  return 'high'
}

export const isTouch = () => matchMedia('(pointer: coarse)').matches
