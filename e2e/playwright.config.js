import { defineConfig, devices } from '@playwright/test';

// E2E tests run against the live deployment by default.
// Override with: BASE_URL=http://localhost:3000 npm test (CI runs them against a local production build).
// CHROMIUM_PATH lets you reuse an existing Chromium binary instead of `npx playwright install`.
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'https://e-commerce-new2-delta.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {}),
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
