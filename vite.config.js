import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from any host
    port: 5173, // Default port for Vite
    watch: {
      usePolling: true, // Use polling for file changes
    }
  }
})
