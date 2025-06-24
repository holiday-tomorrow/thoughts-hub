import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 代理配置
    proxy: {
      // 开发环境下的API代理
      '/api/auth': {
        target: 'http://118.31.0.36:5000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api': {
        target: 'http://118.31.0.36:5000',
        changeOrigin: true,
      }
    }
  }
})
