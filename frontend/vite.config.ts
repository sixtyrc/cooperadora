import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY || 'http://localhost:7000',
        changeOrigin: true,
      },
      '/media': {
        target: process.env.VITE_BACKEND_PROXY || 'http://localhost:7000',
        changeOrigin: true,
      },
    },
  },
})
