import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { routes } from './routes'

for (const route of routes) {
  test(`${route.name}: one h1, main landmark, no axe violations`, async ({ page }) => {
    await page.goto(route.path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main#main')).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
