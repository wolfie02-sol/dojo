import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fonts are self-hosted (no Google Fonts requests). Browsers only download the
// character ranges actually used on the page.
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-ext-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-ext-400.css'
import './styles/fonts.css'
import './styles/global.css'

import { App } from './App'
import { normaliseInitialUrl } from './router/router'

normaliseInitialUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
