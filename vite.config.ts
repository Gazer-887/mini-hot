import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    watch: {
      // 忽略无关目录，避免 Vite watcher 报 EBUSY 崩溃：
      // 1) 编辑工具原子写产生的临时目录（.xxx.tmpdir/，点开头，glob 匹配不到，用函数/正则）
      // 2) 其他工作流目录：android/（Capacitor 打包，另终端在同步写入）、dist/、node_modules/、.vite/
      //    —— 这些被外部进程写入会触发 EBUSY，且不属于热榜源码，无需 watch。
      // 注意：config 被 tsc 检查，lib 较低，用正则（.test）而非 es2015 的 .includes。
      ignored: (path: string) =>
        /\.tmpdir/.test(path) ||
        /[\\/]NOTEBOOK[\\/]/.test(path) ||
        /[\\/]PLAN[\\/]/.test(path) ||
        /[\\/]docs[\\/]/.test(path) ||
        /[\\/]dsh-plugin[\\/]/.test(path) ||
        /[\\/]android[\\/]/.test(path) ||
        /[\\/]dist[\\/]/.test(path) ||
        /[\\/]node_modules[\\/]/.test(path) ||
        /[\\/]\.vite[\\/]/.test(path) ||
        /[\\/]\.git[\\/]/.test(path),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
