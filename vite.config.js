import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/ATLETIQ-STUDIO/' : './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    watch: {
      ignored: ['**/rea-captures/**', '**/tools/**'],
    },
  },
})
