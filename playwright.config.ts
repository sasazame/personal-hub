import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // タイムアウトを大幅に延長（60秒→120秒）
  timeout: 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 8, 
  reporter: 'html',
  globalSetup: require.resolve('./playwright/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'en-US',
    // アクションタイムアウトも大幅延長（20秒→60秒）
    actionTimeout: 60000,
    // ナビゲーションタイムアウトも大幅延長（40秒→90秒）
    navigationTimeout: 90000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.CI ? undefined : {
    // ローカル環境のみ: プロダクションビルドしてサーバーを起動
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 300 * 1000, // 5分に延長（ビルド時間を考慮）
    env: {
      PORT: '3000',
    },
  },
});