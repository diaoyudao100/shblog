import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  define: {
    __WORKER_URL__: JSON.stringify(
      process.env.WORKER_URL || 'https://shblog-worker.diaoyudao110.workers.dev'
    ),
  },
})
