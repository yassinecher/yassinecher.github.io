import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages has no SPA fallback: serving index.html as 404.html lets deep links
// like /projects/batigo load the app.
const spaFallback = () => ({
  name: 'spa-fallback',
  closeBundle() {
    copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback()],
  // Served from the root of yassinecher.github.io
  base: '/',
})
