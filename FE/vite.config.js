import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false, // Allow port fallback if 3001 is busy
    host: true,
    proxy: {
      '/api': {
        // Backend server runs on 3002 when frontend uses 3001
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
