/**
 * Builds tiny Japanese font files containing only the characters the site uses.
 *
 * The full Japanese fonts are 1–4 MB each; the site only needs a few dozen kanji
 * (section accents, calligraphy, Dojo kun). This script scans the config and scene
 * files for Japanese characters and writes subset .woff2 files to public/fonts/.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 * Fonts: Yuji Syuku and Shippori Mincho — SIL Open Font License 1.1 (see ASSETS.md).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const scanDirs = ['src/config', 'src/scene', 'src/ui', 'src/i18n']

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : []
  })
}

let text = ''
for (const d of scanDirs) for (const f of files(join(root, d))) text += readFileSync(f, 'utf8')

// CJK ideographs, kana, CJK punctuation, full-width forms
const jp = [...new Set(text.match(/[　-ヿ㐀-䶿一-鿿＀-￯]/g) ?? [])].join('')
// keep basic Latin too so a fallback never mixes fonts mid-word
const chars = jp + ' 0123456789'

const fonts = [
  { src: 'node_modules/@fontsource/yuji-syuku/files/yuji-syuku-japanese-400-normal.woff2', out: 'public/fonts/yuji-syuku-subset.woff2' },
  { src: 'node_modules/@fontsource/shippori-mincho/files/shippori-mincho-japanese-500-normal.woff2', out: 'public/fonts/shippori-mincho-subset.woff2' },
]

mkdirSync(join(root, 'public/fonts'), { recursive: true })
for (const f of fonts) {
  const buf = readFileSync(join(root, f.src))
  const subset = await subsetFont(buf, chars, { targetFormat: 'woff2' })
  writeFileSync(join(root, f.out), subset)
  console.log(`[fonts] ${f.out}: ${(subset.length / 1024).toFixed(1)} KB (${[...jp].length} Japanese characters)`)
}
