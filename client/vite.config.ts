import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /auth/* → Java Gateway (Tomcat on :8080)
      // pom.xml sets <path>/</path> so Tomcat deploys at root.
      // @WebServlet("/login") → http://localhost:8080/login
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
      // Forward /api/* → Node.js API (Express on :5000)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
