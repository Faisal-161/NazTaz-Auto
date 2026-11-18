import { expect, test, type Page } from '@playwright/test'

/**
 * Global layout: overlays + keyboard behaviour, with screenshots of open states.
 * Cart is seeded via localStorage with a SAMPLE line (same shape as lib/stores/cart.ts).
 */
const sampleCart = {
  state: {
    lines: [
      {
        id: 'line_sample_1',
        merchandiseId: 'gid://mock/ProductVariant/fd-dr-01-door-puddle-lights-2-custom',
        productHandle: 'fd-dr-01-door-puddle-lights',
        title: 'Ford truck door, oval puddle lights',
        variantTitle: '2 lights / Custom',
        unitPrice: { amount: '159.00', currencyCode: 'USD' },
        quantity: 1,
        image: {
          url: '/placeholders/product-night.svg',
          altText: '',
          width: 1200,
          height: 900,
          placeholder: true,
        },
        attributes: [
          { key: '_vehicle', value: '2022 Ford F-150 XLT' },
          { key: '_housing_code', value: 'FD-DR-01' },
          { key: '_fit_method', value: 'picker' },
          { key: '_design_id', value: 'dsg_001' },
          { key: '_design_preview', value: '/placeholders/design-names.svg' },
        ],
      },
    ],
  },
  version: 1,
}
const sampleGarage = {
  state: {
    vehicles: [
      {
        id: 'veh_sample',
        year: 2022,
        make: 'Ford',
        model: 'F-150',
        trim: 'XLT',
        housing_code: 'FD-DR-01',
        fit_method: 'picker',
      },
    ],
    activeId: 'veh_sample',
  },
  version: 1,
}

async function seed(page: Page) {
  await page.addInitScript(
    ({ cart, garage }) => {
      localStorage.setItem('store.cart.v1', cart)
      localStorage.setItem('store.garage.v1', garage)
    },
    { cart: JSON.stringify(sampleCart), garage: JSON.stringify(sampleGarage) },
  )
}

/** Routes linked from the layout that are not built yet. TODO(1B): remove once /products/[handle] exists. */
const NOT_BUILT_YET = [/^\/products\//]

function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource'))
      errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400 && !NOT_BUILT_YET.some((re) => re.test(new URL(r.url()).pathname)))
      errors.push(`HTTP ${r.status()} ${r.url()}`)
  })
  return errors
}

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `.artifacts/screenshots/${name}.png` })

test.describe('desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('skip link, header tab order, cart drawer focus trap + Esc returns focus', async ({
    page,
  }) => {
    const errors = watchConsole(page)
    await seed(page)
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await shot(page, 'layout-skiplink-1440')

    // Garage chip shows the active vehicle; cart count reflects seeded line.
    await expect(page.getByRole('link', { name: /2022 Ford F-150 XLT/ })).toBeVisible()
    const cartBtn = page.getByRole('button', { name: 'Cart, 1 item' })
    await expect(cartBtn).toBeVisible()

    await cartBtn.focus()
    await page.keyboard.press('Enter')
    const drawer = page.getByRole('dialog', { name: 'Your cart' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('FD-DR-01')).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'Edit design' })).toBeVisible()
    await page.waitForTimeout(450) // let the slide-in finish for the screenshot
    await shot(page, 'layout-cart-drawer-1440')

    // Focus stays inside the drawer
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
    expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(cartBtn).toBeFocused()

    // Search dialog opens and closes from keyboard
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByRole('searchbox', { name: /search lights/i })).toBeVisible()
    await shot(page, 'layout-search-1440')
    await page.keyboard.press('Escape')

    expect(errors).toEqual([])
  })

  test('empty cart drawer state', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cart, 0 items' }).click()
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
    await page.waitForTimeout(450)
    await shot(page, 'layout-cart-empty-1440')
  })
})

test.describe('mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('bottom-sheet menu, sticky Find my fit, drawer', async ({ page }) => {
    const errors = watchConsole(page)
    await page.goto('/')
    const sticky = page.getByRole('link', { name: 'Find my fit' }).last()
    await expect(sticky).toBeVisible()
    await shot(page, 'layout-home-viewport-390')

    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('link', { name: /Design studio/ })).toBeVisible()
    await page.waitForTimeout(450)
    await shot(page, 'layout-mobile-menu-390')
    await menu.getByRole('button', { name: 'Close menu' }).click()
    await expect(menu).toBeHidden()

    expect(errors).toEqual([])
  })

  test('cart drawer with sample line', async ({ page }) => {
    await seed(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Cart, 1 item' }).click()
    await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible()
    await page.waitForTimeout(450)
    await shot(page, 'layout-cart-drawer-390')
  })

  test('no horizontal scroll at 390', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
