import { expect, test, type Page } from '@playwright/test'
import { captureWindowOpen, freshStart, trackErrors } from './helpers'

test.beforeEach(async ({ page }) => {
  await freshStart(page)
  await captureWindowOpen(page)
})

const stockOf = (page: Page, name: string) => page.getByLabel(`Stock quantity of ${name}`)

/** Places a real order through the storefront checkout and returns its reference. */
async function placeWebsiteOrder(page: Page, opts: { slug: string; size: string; color: string; qty?: number }) {
  await page.goto(`/#/product/${opts.slug}`)
  await page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: opts.size, exact: true }).click()
  await page.getByRole('radio', { name: opts.color }).click()
  for (let i = 1; i < (opts.qty ?? 1); i++) await page.getByRole('button', { name: 'Increase quantity' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.goto('/#/cart')
  await page.getByRole('button', { name: 'Proceed to WhatsApp Checkout' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/Full name/).fill('Rahim Uddin')
  await dialog.getByLabel(/Phone number/).fill('01812345678')
  await dialog.getByLabel(/Delivery address/).fill('Road 5, Dhanmondi, Dhaka')
  await dialog.getByRole('button', { name: 'Send Order on WhatsApp' }).click()
  const desc = await dialog.getByText(/^Order ref /).textContent()
  await dialog.getByRole('button', { name: /clear my cart/ }).click()
  return desc!.replace('Order ref ', '').trim()
}

test('admin pages render without console errors', async ({ page }) => {
  const t = trackErrors(page)
  for (const r of ['/admin', '/admin/orders', '/admin/orders/new', '/admin/products', '/admin/products/new', '/admin/settings']) {
    await page.goto(`/#${r}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  t.expectNone()
})

test('add a product in admin and it appears in the shop', async ({ page }) => {
  await page.goto('/#/admin/products/new')
  await page.getByRole('button', { name: 'Save Product' }).click()
  await expect(page.locator('main').getByText('Enter a product name.')).toBeVisible()
  await expect(page.locator('main').getByText('Add at least one photo.')).toBeVisible()

  await page.getByLabel(/^Product name/).fill('Linen Resort Shirt')
  await page.getByLabel(/^Category/).selectOption('shirts')
  await page.getByLabel(/^Description/).fill('Breathable linen for hot days.')
  await page.getByLabel(/^Regular price/).fill('2200')
  await page.getByLabel(/^Sale price/).fill('1890')
  await page.getByLabel(/^Stock quantity/).fill('3')
  await page.getByLabel('Image link').fill('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800')
  await page.getByRole('button', { name: 'Add link' }).click()
  await page.getByRole('button', { name: 'Use One Size' }).click()
  await page.getByRole('button', { name: 'Add colour' }).click()
  await page.getByLabel('Colour 2 name').fill('Sand')
  await page.getByRole('button', { name: 'Save Product' }).click()
  await expect(page).toHaveURL(/#\/admin\/products$/)
  await expect(page.getByRole('link', { name: /Linen Resort Shirt/ })).toBeVisible()

  await page.goto('/#/shop?q=linen')
  await expect(page.locator('article h3')).toHaveText(['Linen Resort Shirt'])
  await page.goto('/#/product/linen-resort-shirt')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Linen Resort Shirt')
  await expect(page.getByText('৳1,890').first()).toBeVisible()
  await expect(page.getByText('Only 3 left in stock')).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Sand' })).toBeVisible()
})

test('edit, hide, sell out and delete a product', async ({ page }) => {
  await page.goto('/#/admin/products')
  await page.getByRole('button', { name: 'Edit Signature Black Tee' }).click()
  await page.getByLabel(/^Regular price/).fill('1150')
  await page.getByLabel(/^Sale price/).fill('')
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await page.goto('/#/product/signature-black-tee')
  await expect(page.getByText('৳1,150').first()).toBeVisible()
  await expect(page.getByText('Save 23%')).toHaveCount(0)

  // sold out: stock 0 disables ordering
  await page.goto('/#/admin/products')
  await stockOf(page, 'Essential Heavyweight Tee').fill('0')
  await page.goto('/#/product/essential-heavyweight-tee')
  await expect(page.getByRole('button', { name: 'Sold Out' })).toBeDisabled()

  // hide: gone from the shop, product page shows not found
  await page.goto('/#/admin/products')
  await page.getByRole('button', { name: 'Hide Original Graphic Tee from shop' }).click()
  await page.goto('/#/shop?q=graphic')
  await expect(page.getByText('No products match your filters')).toBeVisible()
  await page.goto('/#/product/original-graphic-tee')
  await expect(page.getByText('Lost in style.')).toBeVisible()

  // delete with confirmation
  await page.goto('/#/admin/products')
  await page.getByRole('button', { name: 'Delete Rust Bomber Jacket' }).click()
  await page.getByRole('dialog', { name: 'Delete product?' }).getByRole('button', { name: 'Delete product' }).click()
  await expect(page.getByRole('link', { name: /Rust Bomber Jacket/ })).toHaveCount(0)
  await page.goto('/#/shop?category=jackets')
  await expect(page.locator('article h3')).not.toContainText(['Rust Bomber Jacket'])
})

test('website order: pending → confirmed (stock drops) → shipped → delivered, visible to the customer', async ({ page }) => {
  const ref = await placeWebsiteOrder(page, { slug: 'washed-denim-jacket', size: 'M', color: 'Sky Blue', qty: 2 })

  await page.goto('/#/admin/products')
  await expect(stockOf(page, 'Washed Denim Jacket')).toHaveValue('12')

  await page.goto('/#/admin/orders?status=pending')
  await page.getByRole('link', { name: new RegExp(ref) }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Order ${ref}`)
  await expect(page.getByText('Rahim Uddin')).toBeVisible()
  await expect(page.getByText('Size M · Sky Blue · 2 × ৳3,490')).toBeVisible()

  await page.getByRole('button', { name: 'Confirm Order' }).click()
  await expect(page.getByText('Stock for these items has been deducted.')).toBeVisible()
  await page.goto('/#/admin/products')
  await expect(stockOf(page, 'Washed Denim Jacket')).toHaveValue('10')

  // the customer sees the new status on My Orders
  await page.goto('/#/orders')
  await expect(page.getByText(`Order ${ref}`, { exact: true })).toBeVisible()
  await expect(page.locator('li', { hasText: `Order ${ref}` }).getByText('Confirmed').first()).toBeVisible()

  await page.goto('/#/admin/orders')
  await page.getByRole('link', { name: new RegExp(ref) }).click()
  await page.getByRole('button', { name: 'Mark as Shipped' }).click()
  await page.getByRole('button', { name: 'Mark as Delivered' }).click()
  await expect(page.getByText('This order is complete.')).toBeVisible()

  await page.goto('/#/admin')
  await expect(page.getByRole('link', { name: /Delivered revenue/ })).toContainText('৳6,980')
})

test('cancelling a confirmed order returns its stock', async ({ page }) => {
  const ref = await placeWebsiteOrder(page, { slug: 'leather-biker-jacket', size: 'L', color: 'Black' })
  await page.goto('/#/admin/orders')
  await page.getByRole('link', { name: new RegExp(ref) }).click()
  await page.getByRole('button', { name: 'Confirm Order' }).click()
  await page.goto('/#/admin/products')
  await expect(stockOf(page, 'Leather Biker Jacket')).toHaveValue('7')

  await page.goto('/#/admin/orders')
  await page.getByRole('link', { name: new RegExp(ref) }).click()
  await page.getByRole('button', { name: 'Cancel Order' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel order' }).click()
  await expect(page.getByText('This order was cancelled.')).toBeVisible()
  await page.goto('/#/admin/products')
  await expect(stockOf(page, 'Leather Biker Jacket')).toHaveValue('8')
})

test('paste a WhatsApp order message to record it', async ({ page }) => {
  const message = [
    '🛍️ *NEW ORDER — URBAN THREADS*',
    'Order Ref: UT-PASTE1',
    '',
    '*Customer Details*',
    'Name: Karim Ahmed',
    'Phone: 01912345678',
    'Address: Lane 3, Agrabad, Chattogram',
    'Delivery Area: Outside Dhaka',
    '',
    '*Order Items*',
    '1. Slim Raw Denim',
    '   Size: 32 | Color: Indigo',
    '   Qty: 1 × ৳3,290 = ৳3,290',
    '2. Mystery Scarf',
    '   Size: One Size | Color: Red',
    '   Qty: 2 × ৳500 = ৳1,000',
    '',
    'Subtotal: ৳4,290',
    'Delivery: FREE',
    '*Total: ৳4,290*',
    '',
    '*Notes:* Deliver after 5pm',
  ].join('\n')

  await page.goto('/#/admin/orders/new?paste=1')
  await page.getByLabel(/^Order message/).fill(message)
  await page.getByRole('button', { name: 'Read order' }).click()
  await expect(page.getByLabel(/^Name/)).toHaveValue('Karim Ahmed')
  await expect(page.getByLabel(/^Phone/)).toHaveValue('01912345678')
  await expect(page.getByLabel(/^Order reference/)).toHaveValue('UT-PASTE1')
  await expect(page.getByRole('alert')).toContainText('Mystery Scarf')
  await page.getByRole('button', { name: 'Save Order' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Order UT-PASTE1')
  await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Total (cash on delivery)')).toBeVisible()
  await expect(page.getByText('৳4,290').last()).toBeVisible()
  await expect(page.getByText('Deliver after 5pm')).toBeVisible()

  // the same message cannot be recorded twice
  await page.goto('/#/admin/orders/new?paste=1')
  await page.getByLabel(/^Order message/).fill(message)
  await page.getByRole('button', { name: 'Read order' }).click()
  await page.getByRole('button', { name: 'Save Order' }).click()
  await expect(page.locator('main').getByText('Order UT-PASTE1 already exists.')).toBeVisible()
})

test('settings change delivery charges used at checkout', async ({ page }) => {
  await page.goto('/#/admin/settings')
  await page.getByLabel(/^Inside Dhaka/).fill('90')
  await page.getByRole('button', { name: 'Save Settings' }).click()
  await expect(page.getByText('Settings saved')).toBeVisible()

  await page.goto('/#/product/signature-black-tee')
  await page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: 'M', exact: true }).click()
  await page.getByRole('radio', { name: 'Black' }).click()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await page.goto('/#/cart')
  await page.getByRole('button', { name: 'Proceed to WhatsApp Checkout' }).click()
  await expect(page.getByRole('dialog').getByText('৳90').first()).toBeVisible()
})
