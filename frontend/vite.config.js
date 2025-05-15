import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key'),
      cert: fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: true
      }
    }
  },
})
