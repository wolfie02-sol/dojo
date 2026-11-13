import { useState } from 'react'
import type { ResponsiveImage } from '../config/media'
import type { Lang } from '../config/site'

const url = (p: string) => (p.startsWith('/') ? `${import.meta.env.BASE_URL}${p.slice(1)}` : p)

/** <picture> with WebP + JPG at several widths. Hides itself gracefully if the file is missing. */
export function Picture({
  image,
  lang,
  sizes,
  className,
  eager = false,
  decorative = false,
}: {
  image: ResponsiveImage
  lang: Lang
  sizes: string
  className?: string
  eager?: boolean
  decorative?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`${className ?? ''} picture--missing`} aria-hidden="true" />
  const set = (ext: string) => image.widths.map((w) => `${url(`${image.base}-${w}.${ext}`)} ${w}w`).join(', ')
  const fallback = url(`${image.base}-${image.widths[Math.min(1, image.widths.length - 1)]}.jpg`)
  return (
    <picture>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        className={className}
        src={fallback}
        srcSet={set('jpg')}
        sizes={sizes}
        alt={decorative ? '' : image.alt[lang]}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        style={image.focus ? { objectPosition: image.focus } : undefined}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
