import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` lets the site live in a sub-folder (e.g. https://example.com/dojo/).
// Set VITE_BASE=/dojo/ when building for a sub-folder; the default is the domain root.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: { target: 'es2020' },
})
