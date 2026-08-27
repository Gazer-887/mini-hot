import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.minihot.app',
  appName: '迷你热榜',
  webDir: 'dist',
  server: {
    // Capacitor 6 推荐用 https scheme 加载本地内容，避免 mixed-content 与部分插件限制
    androidScheme: 'https',
  },
};

export default config;
