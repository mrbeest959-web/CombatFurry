import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets on any hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Reduce build size
  },
  server: {
    port: 3000
  }
})