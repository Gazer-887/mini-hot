import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    watch: {
      // 忽略文档/进度文件（编辑工具原子写产生的临时目录会让 Vite watcher 报 EBUSY 崩溃）
      ignored: ['**/NOTEBOOK/**', '**/PLAN/**', '**/docs/**', '**/.tmpdir/**'],
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
