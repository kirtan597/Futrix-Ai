import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor':     ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'chart-vendor':   ['recharts'],
          'motion-vendor':  ['framer-motion', 'gsap'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

