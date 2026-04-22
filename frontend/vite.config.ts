import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Enable HTTPS when cert files are available and VITE_HTTPS is set
const useHttps = process.env.VITE_HTTPS === 'true' || process.env.VITE_HTTPS === '1'
const certPath = process.env.VITE_HTTPS_CERT       || '/etc/ssl/certs/server.cert'
const keyPath = process.env.VITE_HTTPS_KEY         || '/etc/ssl/certs/server.key'
let httpsConfig = undefined
if (useHttps) {
  try {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsConfig = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      }
      console.log('✓ HTTPS enabled for Vite dev server')
    }
  } catch (err) {
    console.warn('⚠ Could not load HTTPS certificates, running on HTTP', err)
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: httpsConfig,
  },
})
