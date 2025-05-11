import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/server': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, '')
      },
      '/crm': {
        target: 'https://coddy.t8s.ru/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/crm/, '')
      },
      // '/socket.io':{
      //   target: 'http://localhost:4000',
      //   changeOrigin: true,
      //   ws: true,
      // }
    }

  }
})
