import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_DEPLOY_TARGET=pages is set by the GitHub Actions workflow.
// Locally (Docker / dev), this is unset and the app builds at root path.
const isPagesBuild = process.env.VITE_DEPLOY_TARGET === 'pages'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isPagesBuild ? '/bridgeboard/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
