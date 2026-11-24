import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = `http://localhost:${PORT}`
/**
 * Production server for CI, for `pnpm shots` (no dev overlay in screenshots), or PW_PROD=1.
 * Requires a prior `pnpm build`. Otherwise reuse/start `pnpm dev`.
 */
const prod = !!process.env.CI || !!process.env.PW_PROD || process.argv.includes('--project=shots')

/** Visual + interaction captures; not part of the regular e2e run. */
const capture = /(shots|layout)\.spec\.ts/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // PW_CHANNEL=msedge|chrome uses an installed browser instead of the bundled Chromium.
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
      },
      testIgnore: capture,
    },
    {
      name: 'reduced-motion',
      use: { ...devices['Pixel 7'], contextOptions: { reducedMotion: 'reduce' } },
      testIgnore: capture,
    },
    {
      name: 'shots',
      testMatch: capture,
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
      },
    },
  ],
  webServer: {
    command: prod ? `pnpm start --port ${PORT}` : `pnpm dev --port ${PORT}`,
    url: baseURL,
    // Never reuse a prod server: it could be serving an older build.
    reuseExistingServer: !process.env.CI && !prod,
    timeout: 120_000,
  },
})
