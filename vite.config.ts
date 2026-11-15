import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = id.replaceAll('\\\\', '/')
          if (modulePath.includes('/node_modules/three/')) return 'three-vendor'
          if (modulePath.includes('/node_modules/maplibre-gl/')) return 'maplibre-vendor'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
})
