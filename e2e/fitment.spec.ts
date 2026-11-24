import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** Routes linked from the finder that are not built yet. TODO(1B): remove with /products, /studio. */
const NOT_BUILT_YET = [/^\/products\//]

function watch(page: Page) {
  const problems: string[] = []
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource'))
      problems.push(`console: ${m.text()}`)
  })
  page.on('response', (r) => {
    const path = new URL(r.url()).pathname
    if (r.status() >= 400 && !NOT_BUILT_YET.some((re) => re.test(path)))
      problems.push(`HTTP ${r.status()} ${r.url()}`)
  })
  return problems
}

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `.artifacts/screenshots/${name}.png`, fullPage: true })

for (const vp of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test.describe(`fit finder @ ${vp.width}`, () => {
    test.use({ viewport: vp })

    test('F-150: factory yes → vehicle → door vs mirror picker → result → garage', async ({
      page,
    }) => {
      const problems = watch(page)
      await page.goto('/fitment')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/find the lights/i)
      await shot(page, `fitment-1-start-${vp.width}`)

      await page.getByText('Yes, it has them').click()
      await expect(page).toHaveURL(/factory=yes/)
      await page.getByLabel('Year').selectOption('2022')
      await page.getByLabel('Make').selectOption('ford')
      await page.getByLabel('Model').selectOption('f-150')
      await expect(page).toHaveURL(/year=2022&make=ford&model=f-150/)

      // door vs mirror → visual picker
      const picker = page.getByRole('group', { name: /which one is on your car/i })
      await expect(picker).toBeVisible()
      await expect(picker.getByRole('radio')).toHaveCount(2)
      await shot(page, `fitment-2-housing-${vp.width}`)

      // Click the card like a shopper would (the step advances, so the radio unmounts right away).
      await picker.getByText('Ford truck door, oval', { exact: true }).click()
      await expect(page).toHaveURL(/housing=FD-DR-01/)
      await expect(page.getByText('Saved to My Garage')).toBeVisible()
      await expect(page.getByText('FD-DR-01').first()).toBeVisible()
      await expect(page.getByText('Verified fit').first()).toBeVisible()
      await page.waitForTimeout(1000) // let the light-on glow settle for the screenshot
      await shot(page, `fitment-3-result-${vp.width}`)

      if (vp.width >= 1024) {
        await expect(page.getByRole('link', { name: /2022 Ford F-150/ })).toBeVisible() // header garage chip
      }

      // reload restores the same result from the URL
      await page.reload()
      await expect(page.getByText('Saved to My Garage')).toBeVisible()

      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
      expect(problems).toEqual([])
    })

    test('Accord 11th gen → universal path', async ({ page }) => {
      const problems = watch(page)
      await page.goto('/fitment?factory=unsure&year=2024&make=honda&model=accord')
      await expect(page.getByText('Wireless lights for your car').first()).toBeVisible()
      await shot(page, `fitment-4-universal-${vp.width}`)
      expect(problems).toEqual([])
    })
  })
}

test('keyboard only: factory radios, selects, housing radios, focus follows the step', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/fitment')
  // Tab to the first factory radio and pick "Yes" with Space.
  const yes = page.getByRole('radio', { name: /Yes, it has them/ })
  await yes.focus()
  await page.keyboard.press('Space')
  await expect(page).toHaveURL(/factory=yes/)
  // Focus moved to the vehicle step heading
  await expect(page.getByRole('heading', { name: /Your vehicle/ })).toBeFocused()

  await page.getByLabel('Year').selectOption('2023')
  await page.getByLabel('Make').selectOption('tesla')
  await page.getByLabel('Model').selectOption('model-y')
  // Single housing: straight to the result, focus on it
  await expect(page.getByRole('heading', { name: /Your lights/ })).toBeFocused()
  await expect(page.getByText('TS-DR-01').first()).toBeVisible()
})

test('part number search confirms a housing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/fitment')
  await page.getByLabel('OEM part number').fill('sample-rm-2001')
  await page.getByRole('button', { name: 'Use this housing' }).click()
  await expect(page.getByText('RM-MR-01').first()).toBeVisible()
  await expect(page.getByText('Likely fit').first()).toBeVisible()
})

test('VIN: local validation rejects a bad check digit without calling the API', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/fitment')
  await page.getByRole('tab', { name: 'VIN' }).click()
  await page.getByLabel(/VIN \(17 characters\)/).fill('1HGCM82643A004352')
  await page.getByRole('button', { name: 'Look up' }).click()
  await expect(page.getByText(/does not look right/)).toBeVisible()
})
