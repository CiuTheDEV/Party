import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'
const isHeaded = process.env.PLAYWRIGHT_HEADED === '1'
const slowMo = Number.parseInt(process.env.PLAYWRIGHT_SLOWMO_MS ?? '0', 10)

export default defineConfig({
  testDir: './apps/hub/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    headless: !isHeaded,
    launchOptions: Number.isFinite(slowMo) && slowMo > 0
      ? { slowMo }
      : undefined,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev:next --workspace @party/hub -- --hostname 127.0.0.1 --port 3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      },
})
