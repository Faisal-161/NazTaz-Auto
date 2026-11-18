import { test } from '@playwright/test'
import { routes } from './routes'

const viewports = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const

/**
 * Full-page screenshots per route at 390 + 1440 → .artifacts/screenshots.
 * Fails on JS errors, console errors, or any failed request (except the 404 route's own document).
 */
for (const route of routes) {
  for (const vp of viewports) {
    test(`${route.name} @ ${vp.width}`, async ({ page, baseURL }) => {
      const problems: string[] = []
      const expectedDoc = new URL(route.path, baseURL).href
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
      page.on('console', (m) => {
        // Network failures are reported (with URLs) by the response handler below.
        if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) problems.push(`console: ${m.text()}`)
      })
      page.on('response', (r) => {
        if (r.status() < 400) return
        const isExpected404 = route.name === 'not-found' && r.status() === 404 && r.url() === expectedDoc
        if (!isExpected404) problems.push(`HTTP ${r.status()} ${r.url()}`)
      })
      await page.setViewportSize(vp)
      await page.goto(route.path, { waitUntil: 'networkidle' })
      await page.screenshot({ path: `.artifacts/screenshots/${route.name}-${vp.width}.png`, fullPage: true })
      if (problems.length) throw new Error(`Problems on ${route.path}:\n${problems.join('\n')}`)
    })
  }
}
