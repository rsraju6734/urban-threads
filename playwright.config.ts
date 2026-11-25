import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests for the URBAN THREADS storefront and the Khoka Tech Client Studio.
 * Runs against its own Vite dev server on port 5199 so it never collides with `npm run dev`.
 *
 *   npm run test:e2e            # headless, desktop + mobile
 *   npm run test:e2e -- --ui    # interactive runner
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5199/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive|storefront/ },
  ],
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    url: 'http://localhost:5199/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
