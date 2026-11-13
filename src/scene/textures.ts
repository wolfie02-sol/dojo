/**
 * Procedural textures, painted on <canvas> at start-up.
 * No image downloads → nothing to fail, tiny bundle, resolution scales with quality.
 * All textures are disposed when the scene unmounts (see disposeTextures).
 */
import * as THREE from 'three'
import { palette } from '../config/theme'

/** Deterministic random so the scene looks the same on every visit */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const BRUSH_FONT = '"Yuji Syuku", "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function finish(c: HTMLCanvasElement, repeat?: [number, number]) {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...repeat)
  }
  return tex
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, amount)
  return `#${c.getHexString()}`
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, r: () => number, lines: number, horizontal = true) {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < lines; i++) {
    ctx.strokeStyle = shade(base, (r() - 0.5) * 0.12)
    ctx.globalAlpha = 0.25 + r() * 0.35
    ctx.lineWidth = 0.6 + r() * 1.8
    ctx.beginPath()
    const p = r() * (horizontal ? h : w)
    const amp = 1 + r() * 4
    const freq = 0.004 + r() * 0.01
    for (let x = 0; x <= (horizontal ? w : h); x += 8) {
      const y = p + Math.sin(x * freq + i) * amp
      if (horizontal) ctx.lineTo(x, y)
      else ctx.lineTo(y, x)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, r: () => number, count: number, colors: string[], size: [number, number], alpha = 0.5) {
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha * (0.4 + r() * 0.6)
    ctx.fillStyle = colors[Math.floor(r() * colors.length)]
    const s = size[0] + r() * (size[1] - size[0])
    ctx.beginPath()
    ctx.ellipse(r() * w, r() * h, s, s * (0.6 + r() * 0.5), r() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** Floor boards running away from the viewer */
function floorBoards(size: number) {
  const r = rng(11)
  const [c, ctx] = canvas(size, size)
  const boards = 8
  const bw = size / boards
  for (let b = 0; b < boards; b++) {
    const tone = shade('#d8b892', (r() - 0.5) * 0.06 + 0.02)
    ctx.save()
    ctx.translate(b * bw, 0)
    grain(ctx, bw, size, tone, r, 26, false)
    ctx.restore()
    ctx.fillStyle = 'rgba(70,45,25,0.45)'
    ctx.fillRect(b * bw, 0, Math.max(1, size / 512), size)
    // board end joints
    const joint = r() * size
    ctx.fillRect(b * bw, joint, bw, Math.max(1, size / 700))
  }
  return finish(c, [2.5, 3.5])
}

function woodBeam(size: number, base: string, seed: number) {
  const r = rng(seed)
  const [c, ctx] = canvas(size / 2, size / 2)
  grain(ctx, size / 2, size / 2, base, r, 40)
  return finish(c, [1, 1])
}

function plaster(size: number) {
  const r = rng(5)
  const [c, ctx] = canvas(size / 2, size / 2)
  ctx.fillStyle = palette.plaster
  ctx.fillRect(0, 0, size / 2, size / 2)
  noise(ctx, size / 2, size / 2, r, 2200, [shade(palette.plaster, 0.04), shade(palette.plaster, -0.04), '#d9c9ad'], [0.5, 2.2], 0.35)
  return finish(c, [2, 2])
}

/** Shoji paper with kumiko lattice: 3 columns × 4 rows per panel */
function shoji(size: number) {
  const r = rng(9)
  const w = size / 2
  const h = size
  const [c, ctx] = canvas(w, h)
  ctx.fillStyle = '#fbf6ec'
  ctx.fillRect(0, 0, w, h)
  noise(ctx, w, h, r, 900, ['#efe5d2', '#fffaf0'], [0.6, 2], 0.4)
  ctx.fillStyle = palette.woodMid
  const bar = Math.max(2, w / 70)
  for (let i = 0; i <= 3; i++) ctx.fillRect((i / 3) * w - bar / 2, 0, bar, h)
  for (let j = 0; j <= 4; j++) ctx.fillRect(0, (j / 4) * h - bar / 2, w, bar)
  ctx.fillRect(0, 0, bar * 2.5, h)
  ctx.fillRect(w - bar * 2.5, 0, bar * 2.5, h)
  ctx.fillRect(0, 0, w, bar * 2.5)
  ctx.fillRect(0, h - bar * 2.5, w, bar * 2.5)
  return finish(c)
}

function gravel(size: number) {
  const r = rng(21)
  const [c, ctx] = canvas(size / 2, size / 2)
  const s = size / 2
  ctx.fillStyle = palette.gravel
  ctx.fillRect(0, 0, s, s)
  noise(ctx, s, s, r, 5200, ['#c9c0b0', '#e9e2d5', '#b8ae9c', '#f3eee5'], [0.7, 2.2], 0.75)
  // raked lines (samon)
  ctx.strokeStyle = 'rgba(120,108,90,0.18)'
  ctx.lineWidth = s / 160
  for (let y = 0; y < s; y += s / 16) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(s, y)
    ctx.stroke()
  }
  return finish(c, [3, 10])
}

function grass(size: number) {
  const r = rng(31)
  const s = size / 2
  const [c, ctx] = canvas(s, s)
  ctx.fillStyle = palette.grass
  ctx.fillRect(0, 0, s, s)
  noise(ctx, s, s, r, 4200, ['#7f8f58', '#a3ae78', '#6f7d4b', '#b2b885'], [0.8, 3], 0.55)
  noise(ctx, s, s, r, 140, [palette.sakura, palette.sakuraPale], [1, 2.2], 0.75) // fallen petals
  return finish(c, [26, 26])
}

function roofTiles(size: number) {
  const s = size / 2
  const [c, ctx] = canvas(s, s)
  ctx.fillStyle = palette.roof
  ctx.fillRect(0, 0, s, s)
  const cols = 10
  for (let i = 0; i < cols; i++) {
    const x = (i / cols) * s
    const g = ctx.createLinearGradient(x, 0, x + s / cols, 0)
    g.addColorStop(0, 'rgba(0,0,0,0.35)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.10)')
    g.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = g
    ctx.fillRect(x, 0, s / cols, s)
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let j = 0; j < 8; j++) ctx.fillRect(0, (j / 8) * s, s, s / 120)
  return finish(c, [6, 3])
}

/** Lattice (koshi) wooden sliding door */
function latticeDoor(size: number) {
  const r = rng(41)
  const w = size / 2
  const h = size
  const [c, ctx] = canvas(w, h)
  grain(ctx, w, h, palette.woodMid, r, 30, false)
  // recessed paper behind the lattice
  ctx.fillStyle = '#e9dcc4'
  const m = w * 0.1
  ctx.fillRect(m, h * 0.06, w - m * 2, h * 0.62)
  ctx.fillStyle = palette.woodDark
  const slats = 9
  for (let i = 0; i <= slats; i++) {
    const x = m + ((w - m * 2) * i) / slats
    ctx.fillRect(x - w * 0.012, h * 0.06, w * 0.024, h * 0.62)
  }
  ctx.fillRect(m, h * 0.37 - 3, w - 2 * m, 6)
  // lower solid panel border
  ctx.strokeStyle = 'rgba(40,24,14,0.55)'
  ctx.lineWidth = w * 0.012
  ctx.strokeRect(m, h * 0.72, w - m * 2, h * 0.22)
  // recessed finger pull
  ctx.fillStyle = 'rgba(30,20,12,0.6)'
  ctx.beginPath()
  ctx.ellipse(w * 0.5, h * 0.53, w * 0.03, h * 0.025, 0, 0, Math.PI * 2)
  ctx.fill()
  return finish(c)
}

/** Calligraphy on paper/wood — decorative only (all real text is HTML) */
export function calligraphy(
  text: string,
  opts: { w: number; h: number; vertical: boolean; bg: string; ink: string; border?: string; seal?: boolean; font?: string },
) {
  const [c, ctx] = canvas(opts.w, opts.h)
  ctx.fillStyle = opts.bg
  ctx.fillRect(0, 0, opts.w, opts.h)
  noise(ctx, opts.w, opts.h, rng(text.length * 7), (opts.w * opts.h) / 300, [shade(opts.bg, -0.04), shade(opts.bg, 0.03)], [0.6, 2], 0.35)
  if (opts.border) {
    ctx.strokeStyle = opts.border
    ctx.lineWidth = Math.min(opts.w, opts.h) * 0.03
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, opts.w - ctx.lineWidth, opts.h - ctx.lineWidth)
  }
  ctx.fillStyle = opts.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const chars = [...text]
  if (opts.vertical) {
    const fs = Math.min(opts.w * 0.62, (opts.h * 0.78) / chars.length)
    ctx.font = `${fs}px ${opts.font ?? BRUSH_FONT}`
    const total = fs * chars.length
    chars.forEach((ch, i) => ctx.fillText(ch, opts.w / 2, (opts.h - total) / 2 + fs * (i + 0.5) - opts.h * 0.03))
  } else {
    const fs = Math.min(opts.h * 0.6, (opts.w * 0.82) / chars.length)
    ctx.font = `${fs}px ${opts.font ?? BRUSH_FONT}`
    ctx.fillText(text, opts.w / 2, opts.h / 2)
  }
  if (opts.seal) {
    ctx.fillStyle = '#b5392f'
    const s = opts.w * 0.12
    ctx.fillRect(opts.w * 0.62, opts.h * 0.86, s, s)
  }
  return finish(c)
}

/** Wooden name tags (nafudakake) — anonymous strokes, real names are in the HTML panel */
function nameBoard(size: number) {
  const r = rng(51)
  const w = size
  const h = Math.round(size * 0.62)
  const [c, ctx] = canvas(w, h)
  grain(ctx, w, h, palette.woodDark, r, 40)
  ctx.fillStyle = palette.woodLight
  ctx.font = `${h * 0.11}px ${BRUSH_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#f1e4cc'
  ctx.fillText('有 段 者', w / 2, h * 0.1)
  const rows = 2
  const cols = 9
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tw = (w * 0.86) / cols
      const x = w * 0.07 + col * tw + tw * 0.12
      const y = h * 0.22 + row * h * 0.39
      const th = h * 0.33
      ctx.fillStyle = shade('#e6d3b0', (r() - 0.5) * 0.06)
      ctx.fillRect(x, y, tw * 0.76, th)
      ctx.fillStyle = 'rgba(40,28,20,0.75)'
      const strokes = 3 + Math.floor(r() * 3)
      for (let s = 0; s < strokes; s++) {
        ctx.fillRect(x + tw * 0.3, y + th * 0.12 + s * th * 0.16, tw * 0.16 + r() * tw * 0.06, th * 0.07)
      }
    }
  }
  return finish(c)
}

/** Timetable board with a paper sheet */
function scheduleBoard(size: number) {
  const r = rng(61)
  const w = size
  const h = Math.round(size * 0.7)
  const [c, ctx] = canvas(w, h)
  grain(ctx, w, h, palette.woodMid, r, 30)
  ctx.fillStyle = '#f7f0e2'
  ctx.fillRect(w * 0.08, h * 0.2, w * 0.84, h * 0.72)
  ctx.fillStyle = '#f1e4cc'
  ctx.font = `${h * 0.12}px ${BRUSH_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('稽古', w / 2, h * 0.1)
  ctx.strokeStyle = 'rgba(60,40,28,0.45)'
  ctx.lineWidth = Math.max(1, w / 400)
  for (let i = 1; i < 7; i++) {
    const x = w * 0.08 + (w * 0.84 * i) / 7
    ctx.beginPath()
    ctx.moveTo(x, h * 0.22)
    ctx.lineTo(x, h * 0.9)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(60,40,28,0.7)'
  for (let i = 0; i < 7; i++) {
    const x = w * 0.08 + (w * 0.84 * (i + 0.5)) / 7
    if (r() > 0.35) {
      ctx.fillRect(x - w * 0.035, h * 0.3 + r() * h * 0.2, w * 0.07, h * 0.03)
      ctx.fillRect(x - w * 0.03, h * 0.55 + r() * h * 0.2, w * 0.06, h * 0.03)
    }
  }
  return finish(c)
}

/** Hanging paper calendar (koyomi) */
function calendarSheet(size: number) {
  const r = rng(71)
  const w = Math.round(size * 0.72)
  const h = size
  const [c, ctx] = canvas(w, h)
  ctx.fillStyle = '#f8f2e6'
  ctx.fillRect(0, 0, w, h)
  noise(ctx, w, h, r, 900, ['#ece2cf', '#fffaf0'], [0.6, 2], 0.4)
  ctx.fillStyle = palette.charcoal
  ctx.font = `${h * 0.13}px ${BRUSH_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('暦', w / 2, h * 0.14)
  ctx.fillStyle = '#c0485e'
  ctx.beginPath()
  ctx.arc(w * 0.8, h * 0.13, w * 0.05, 0, Math.PI * 2)
  ctx.fill()
  const cols = 7
  const rows = 5
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = w * 0.08 + (w * 0.84 * i) / cols
      const y = h * 0.3 + (h * 0.62 * j) / rows
      ctx.strokeStyle = 'rgba(60,40,28,0.25)'
      ctx.strokeRect(x, y, (w * 0.84) / cols, (h * 0.62) / rows)
      if (r() > 0.88) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(192,72,94,0.75)' : 'rgba(60,40,28,0.6)'
        ctx.beginPath()
        ctx.arc(x + (w * 0.84) / cols / 2, y + (h * 0.62) / rows / 2, w * 0.022, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  return finish(c)
}

/** Sepia portrait placeholder (the real photo is shown in the HTML panel) */
function portrait(size: number) {
  const w = Math.round(size * 0.6)
  const h = Math.round(size * 0.75)
  const [c, ctx] = canvas(w, h)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#d8c8aa')
  g.addColorStop(1, '#bfa983')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(70,52,36,0.55)'
  ctx.beginPath()
  ctx.arc(w / 2, h * 0.38, w * 0.17, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.98, w * 0.38, h * 0.36, 0, Math.PI, 0)
  ctx.fill()
  // white gi lapels
  ctx.fillStyle = 'rgba(250,244,232,0.85)'
  ctx.beginPath()
  ctx.moveTo(w * 0.36, h * 0.66)
  ctx.lineTo(w * 0.5, h * 0.9)
  ctx.lineTo(w * 0.64, h * 0.66)
  ctx.lineTo(w * 0.58, h * 0.64)
  ctx.lineTo(w * 0.5, h * 0.8)
  ctx.lineTo(w * 0.42, h * 0.64)
  ctx.fill()
  return finish(c)
}

/** Ema (wooden votive tablets) used for the links rack */
function emaTablet(size: number) {
  const r = rng(81)
  const s = size / 4
  const [c, ctx] = canvas(s, s)
  grain(ctx, s, s, '#d8b98f', r, 18)
  ctx.strokeStyle = '#8c2f3c'
  ctx.lineWidth = s * 0.04
  ctx.beginPath()
  ctx.arc(s / 2, s * 0.55, s * 0.2, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#8c2f3c'
  ctx.beginPath()
  ctx.arc(s / 2, s * 0.55, s * 0.07, 0, Math.PI * 2)
  ctx.fill()
  return finish(c)
}

/** Sky gradient + distant hills */
function sky(size: number) {
  const [c, ctx] = canvas(8, size / 2)
  const g = ctx.createLinearGradient(0, 0, 0, size / 2)
  g.addColorStop(0, palette.skyHigh)
  g.addColorStop(0.45, '#e9e3dd')
  g.addColorStop(0.62, palette.sky)
  g.addColorStop(1, '#f8efe6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 8, size / 2)
  const tex = finish(c)
  return tex
}

export type TextureSet = ReturnType<typeof createTextures>

export function createTextures(size: number, calligraphyText: string, signText: string) {
  return {
    floor: floorBoards(size),
    beam: woodBeam(size, palette.woodDark, 2),
    post: woodBeam(size, palette.woodMid, 3),
    plaster: plaster(size),
    shoji: shoji(size),
    gravel: gravel(size),
    grass: grass(size),
    roof: roofTiles(size),
    door: latticeDoor(size),
    scroll: calligraphy(calligraphyText, { w: size / 4, h: size, vertical: true, bg: '#f4ecdc', ink: '#1d1916', seal: true }),
    sign: calligraphy(signText, { w: size / 2, h: size / 5, vertical: false, bg: palette.woodDark, ink: '#f0e2c6', border: '#3b2618' }),
    names: nameBoard(size),
    schedule: scheduleBoard(size),
    calendar: calendarSheet(size / 2),
    portrait: portrait(size / 2),
    ema: emaTablet(size),
    sky: sky(size),
  }
}

export function disposeTextures(set: TextureSet | null) {
  if (!set) return
  Object.values(set).forEach((t) => t.dispose())
}

/** Wait (briefly) for the brush font so calligraphy doesn't render with a fallback font. */
export async function loadBrushFont(text: string, timeoutMs = 3500) {
  if (!('fonts' in document)) return
  const load = Promise.all([
    document.fonts.load(`64px "Yuji Syuku"`, text),
    document.fonts.load(`64px "Shippori Mincho"`, text),
  ]).catch(() => undefined)
  await Promise.race([load, new Promise((r) => setTimeout(r, timeoutMs))])
}
