import { useState, type ReactNode } from 'react'
import type { Lang } from '../config/site'
import { UI } from '../i18n/ui'

const PLACEHOLDER_PHOTO = `${import.meta.env.BASE_URL}images/placeholder-person.svg`

/** Shown wherever a value is still `null` in content.ts */
export function ComingSoon({ lang }: { lang: Lang }) {
  return <span className="coming-soon">{UI[lang].comingSoon}</span>
}

/** Small badge marking sample/placeholder content */
export function ExampleBadge({ lang, show = true }: { lang: Lang; show?: boolean }) {
  if (!show) return null
  return <span className="badge badge--example">{UI[lang].example}</span>
}

export function OrSoon({ value, lang, children }: { value: unknown; lang: Lang; children?: ReactNode }) {
  if (value === null || value === undefined || value === '') return <ComingSoon lang={lang} />
  return <>{children}</>
}

/** Photo with a neutral silhouette when missing or when the file fails to load */
export function Photo({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const real = src && !failed ? (src.startsWith('/') ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src) : null
  return (
    <img
      className={`photo${real ? '' : ' photo--placeholder'}${className ? ` ${className}` : ''}`}
      src={real ?? PLACEHOLDER_PHOTO}
      alt={real ? alt : ''}
      loading="lazy"
      decoding="async"
      width={300}
      height={375}
      onError={() => setFailed(true)}
    />
  )
}
