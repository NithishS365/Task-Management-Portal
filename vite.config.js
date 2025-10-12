import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic' // This enables the new JSX transform
  })],
  server: {
    port: 5173,
    host: true
  }
})