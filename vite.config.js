import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/Game-Library/ (GitHub Pages project site)
  base: '/Game-Library/',
})
