import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173/a2-mocktest/',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/a2-mocktest/',
    reuseExistingServer: true,
    timeout: 15_000,
  },
})
