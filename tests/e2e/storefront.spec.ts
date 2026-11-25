import { expect, test } from '@playwright/test'
import { captureWindowOpen, freshStart, openedUrls, STORE_ROUTES, trackErrors } from './helpers'

test.beforeEach(async ({ page }) => {
  await freshStart(page)
})

test('every storefront page renders without console errors', async ({ page }) => {
  const t = trackErrors(page)
  for (const route of STORE_ROUTES) {
    await page.goto(`/#${route}`)
    await expect(page.locator('main h1').first()).toBeVisible()
  }
  t.expectNone()
})

test('navigation links lead to the right pages', async ({ page, isMobile }) => {
  await page.goto('/#/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('STYLE THAT')
  const go = async (name: string) => {
    if (isMobile) {
      await page.getByRole('button', { name: 'Open menu' }).click()
      await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name, exact: true }).click()
    } else {
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true }).click()
    }
  }
  await go('Shop')
  await expect(page).toHaveURL(/#\/shop/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('All Products')
  await go('About')
  await expect(page).toHaveURL(/#\/about/)
  await go('Contact')
  await expect(page).toHaveURL(/#\/contact/)
  await go('FAQ')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('FAQ & Delivery')
  await page.goto('/#/nope')
  await expect(page.getByText('Lost in style.')).toBeVisible()
})

test('hero slideshow can be paused and navigated', async ({ page }) => {
  await page.goto('/#/')
  const pause = page.getByRole('button', { name: 'Pause slideshow' })
  await pause.click()
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Next slide' }).click()
  await expect(page.getByText('2 / 3')).toBeVisible()
})

test('shop filters, search and sort', async ({ page, isMobile }) => {
  test.skip(isMobile, 'filter sidebar is a drawer on mobile — covered by URL params below')
  await page.goto('/#/shop')
  const filters = page.getByRole('complementary', { name: 'Product filters' })
  await filters.getByRole('button', { name: /Jackets & Outerwear/ }).click()
  await expect(page.getByText(/Showing\s+5\s+products/)).toBeVisible()
  await page.getByLabel('Sort by').selectOption('price-asc')
  const titles = page.locator('article h3')
  await expect(titles.first()).toHaveText('Washed Denim Jacket')
  await filters.getByRole('button', { name: /All Products/ }).click()
  await expect(page).not.toHaveURL(/category=/)
  await filters.getByLabel('Search', { exact: true }).fill('denim')
  await expect(page.getByText(/Showing\s+3\s+products/)).toBeVisible()
  await filters.getByLabel('Search', { exact: true }).fill('zzzz')
  await expect(page.getByText('No products match your filters')).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page.getByText(/Showing\s+17\s+products/)).toBeVisible()
})

test('shop filters work from the URL (shareable links)', async ({ page }) => {
  await page.goto('/#/shop?sale=1&category=tshirts')
  await expect(page.locator('article h3')).toHaveText(['Signature Black Tee', 'Original Graphic Tee'])
  await page.goto('/#/shop?min=1000&max=1500')
  await expect(page.locator('article')).toHaveCount(4)
})

test('product details require size and colour, then add to cart', async ({ page }) => {
  await page.goto('/#/product/signature-black-tee')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Signature Black Tee')
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('Please select a size').first()).toBeVisible()
  await page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: 'M', exact: true }).click()
  await page.getByRole('radio', { name: 'Black' }).click()
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByRole('button', { name: /Open cart, 2 items/ })).toBeVisible()
  // gallery: thumbnails switch the main image
  await page.getByRole('button', { name: 'Show image 2' }).click()
  await expect(page.getByAltText('Signature Black Tee — image 2')).toBeVisible()
})

test('cart: change quantity, remove, then WhatsApp checkout message', async ({ page }) => {
  await captureWindowOpen(page)
  await page.goto('/#/product/pique-cotton-polo')
  await page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: 'L', exact: true }).click()
  await page.getByRole('radio', { name: 'Emerald' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.goto('/#/product/slim-raw-denim')
  await page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: '32' }).click()
  await page.getByRole('radio', { name: 'Indigo' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()

  await page.goto('/#/cart')
  await page.getByRole('group', { name: 'Quantity for Piqué Cotton Polo' }).getByRole('button', { name: 'Increase quantity' }).click()
  await page.getByRole('button', { name: 'Remove Slim Raw Denim' }).click()
  await expect(page.getByRole('button', { name: 'Remove Slim Raw Denim' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Proceed to WhatsApp Checkout' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Send Order on WhatsApp' }).click()
  await expect(dialog.getByText('Please enter your full name.')).toBeVisible()

  await dialog.getByLabel(/Full name/).fill('Test Customer')
  await dialog.getByLabel(/Phone number/).fill('01712345678')
  await dialog.getByLabel(/Delivery address/).fill('Road 2, Banani, Dhaka')
  await dialog.getByText('Outside Dhaka').click()
  await dialog.getByLabel(/Order notes/).fill('Call before delivery')
  await dialog.getByRole('button', { name: 'Send Order on WhatsApp' }).click()

  await expect(dialog.getByText('WhatsApp opened with your order message.')).toBeVisible()
  const [url] = await openedUrls(page)
  expect(url).toMatch(/^https:\/\/wa\.me\/\d*\?text=/)
  const msg = decodeURIComponent(url.split('text=')[1])
  expect(msg).toContain('Name: Test Customer')
  expect(msg).toContain('Phone: 01712345678')
  expect(msg).toContain('Delivery Area: Outside Dhaka')
  expect(msg).toContain('1. Piqué Cotton Polo')
  expect(msg).toContain('Size: L | Color: Emerald')
  expect(msg).toContain('Qty: 2 × ৳1,490 = ৳2,980')
  expect(msg).toContain('Delivery: FREE') // ৳2,980 is over the ৳2,000 threshold
  expect(msg).toContain('*Total: ৳2,980*')
  expect(msg).toContain('Notes:* Call before delivery')
  expect(msg).not.toContain('Slim Raw Denim')

  await dialog.getByRole('button', { name: /clear my cart/ }).click()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
})

test('quick view adds to cart and opens the drawer', async ({ page }) => {
  await page.goto('/#/shop?category=polos')
  await page.getByRole('button', { name: 'Quick Add' }).click()
  const dialog = page.getByRole('dialog', { name: 'Piqué Cotton Polo' })
  await dialog.getByRole('radio', { name: 'S', exact: true }).click()
  await dialog.getByRole('radio', { name: 'Navy' }).click()
  await dialog.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByRole('dialog', { name: /Your Cart \(1\)/ })).toBeVisible()
})

test('content stays visible with reduced motion', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await freshStart(page)
  await page.goto('/#/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // autoplay is off under reduced motion
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible()
  await page.mouse.wheel(0, 4000)
  await expect(page.getByRole('heading', { name: 'Designed with intent.' })).toBeVisible()
  await ctx.close()
})
