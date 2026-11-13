/** Inline SVG icons (decorative: aria-hidden; buttons carry their own text labels). */
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false }

export const IconMenu = () => (
  <svg {...base}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)
export const IconClose = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconArrowLeft = () => (
  <svg {...base}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)
export const IconChevron = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <svg {...base} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)
export const IconExternal = () => (
  <svg {...base} width={16} height={16}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)
export const IconMotion = ({ reduced }: { reduced: boolean }) => (
  <svg {...base}>
    {reduced ? <path d="M5 12h14" /> : <path d="M3 12c3-6 6-6 9 0s6 6 9 0" />}
  </svg>
)
export const IconReplay = () => (
  <svg {...base}>
    <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />
  </svg>
)
export const IconHome = () => (
  <svg {...base}>
    <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />
  </svg>
)
export const IconPin = () => (
  <svg {...base} width={18} height={18}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
