import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['input-switch-polyfill'],
  },
  server: {
    host: true,
    watch: {
      ignored: ['**/rea-captures/**', '**/tools/**'],
    },
  },
})
