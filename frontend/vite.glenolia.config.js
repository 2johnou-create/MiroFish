import { defineConfig, mergeConfig } from 'vite'
import upstream from './vite.config.js'

// Explicit local-only profile. The upstream default remains available separately.
export default mergeConfig(upstream, defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3300,
    strictPort: true,
    open: false,
    allowedHosts: ['127.0.0.1'],
    proxy: {
      '/api': { target: 'http://127.0.0.1:5501', changeOrigin: false },
      '/health': { target: 'http://127.0.0.1:5501', changeOrigin: false }
    }
  },
  preview: { host: '127.0.0.1', port: 3300, strictPort: true, open: false }
}))
