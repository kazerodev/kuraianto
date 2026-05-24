import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en:   resolve(__dirname, 'en.html'),
        nl:   resolve(__dirname, 'nl.html'),
        fr:   resolve(__dirname, 'fr.html'),
      },
    },
  },
})
