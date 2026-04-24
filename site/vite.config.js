import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/chat': 'http://localhost:7860',
      '/api/clear': 'http://localhost:7860',
    },
  },
})
