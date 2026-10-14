import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages has no SPA fallback: serving index.html as 404.html lets deep links
// like /portfolio-3D/projects/batigo load the app.
const spaFallback = () => ({
  name: 'spa-fallback',
  closeBundle() {
    copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallback()],
  base:'/portfolio-3D/'
})
