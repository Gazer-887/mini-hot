import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    watch: {
      // 忽略编辑工具原子写产生的临时目录（.xxx.tmpdir/），避免 Vite watcher 报 EBUSY 崩溃。
      // 用函数而非 glob：glob 的 `*` 默认不匹配以 `.` 开头的目录段（micromatch dot:false），
      // 而 `.progress.md.xxx.tmpdir` 正是点开头目录，函数匹配最可靠。
      ignored: (path: string) =>
        path.includes('.tmpdir') ||
        path.includes('\\NOTEBOOK\\') ||
        path.includes('\\PLAN\\') ||
        path.includes('\\docs\\') ||
        path.includes('\\dsh-plugin\\'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
