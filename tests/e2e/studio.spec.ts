import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { freshStart, STUDIO_ROUTES, trackErrors } from './helpers'

test.beforeEach(async ({ page }) => {
  await freshStart(page)
})

/** Opens a form section from the left step list. */
const section = (page: Page, name: RegExp) => page.getByRole('navigation', { name: 'Form sections' }).getByRole('button', { name }).click()

async function createClient(page: Page, opts: { complete: boolean }) {
  await page.goto('/#/studio/new')
  await page.getByLabel(/^Brand Name/).fill('Nokshi Wear')
  await page.getByLabel(/^Brand Tagline/).fill('Modern Bangladeshi streetwear')
  await page.getByLabel(/^Business Description/).fill('Dhaka streetwear label with kantha-inspired graphics.')
  await page.getByLabel(/^Brand Email/).fill(opts.complete ? 'hello@nokshi.example' : 'not-an-email')
  await page.getByLabel(/^WhatsApp Number/).fill('8801700000000')
  await page.getByLabel(/^Facebook URL/).fill('https://facebook.com/nokshi.example')

  await section(page, /Design|Brand Design/)
  await page.getByRole('button', { name: 'Streetwear' }).click()

  await section(page, /Products|Product Information/)
  await page.getByLabel(/^Product Name/).fill('Kantha Heavyweight Tee')
  await page.getByLabel(/^Product Category/).fill('T-Shirts')
  await page.getByLabel(/^Regular Price/).fill('1500')
  await page.getByLabel(/^Discount Price/).fill(opts.complete ? '1290' : '1800')
  await page.getByLabel('Image URL 1').fill('https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=800')
  await page.getByRole('button', { name: 'Add image URL' }).click()
  await page.getByLabel('Image URL 2').fill('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800')
  await page.getByLabel(/^Available Sizes/).fill('M, L, XL')
  await page.getByLabel(/^Available Colors/).fill('Black, Off-White')
  await page.getByRole('switch', { name: 'Featured Product' }).click()

  // dynamic product creation
  await page.getByRole('button', { name: 'Add Another Product' }).click()
  await page.getByLabel(/^Product Name/).last().fill('Nokshi Pullover Hoodie')
  await page.getByLabel(/^Product Category/).last().fill('Hoodies')
  await page.getByLabel(/^Regular Price/).last().fill('2800')
  await page.getByLabel('Image URL 1').last().fill('https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=800')
  await expect(page.getByText(/^2\s*products/)).toBeVisible()

  await section(page, /Features|Website Requirements/)
  await page.getByLabel(/Payment Gateway/).check()

  if (opts.complete) {
    await section(page, /Delivery|Order & Delivery/)
    await page.getByLabel(/^Delivery Inside Dhaka/).fill('80')
    await page.getByLabel(/^Delivery Outside Dhaka/).fill('150')
    await page.getByLabel(/^Free Delivery Threshold/).fill('2500')
    await page.getByLabel(/^Return Policy/).fill('Returns within 3 days for damaged items.')
  }
  await page.getByRole('button', { name: 'Save & Preview' }).first().click()
  await expect(page).toHaveURL(/#\/studio\/client\//)
}

test('studio pages render without console errors', async ({ page }) => {
  const t = trackErrors(page)
  for (const r of STUDIO_ROUTES) {
    await page.goto(`/#${r}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  t.expectNone()
})

test('form validation keeps an incomplete profile as a draft', async ({ page }) => {
  await page.goto('/#/studio/new')
  await page.getByRole('button', { name: 'Save & Preview' }).first().click()
  await expect(page.getByText('Brand name is required')).toBeVisible()

  await createClient(page, { complete: false })
  await expect(page.getByText('Draft', { exact: true })).toBeVisible()
  await expect(page.getByText('Brand email is not a valid email address')).toBeVisible()
  await expect(page.getByText('Kantha Heavyweight Tee: discount price must be lower than the regular price')).toBeVisible()
  await expect(page.getByText('Delivery charge inside Dhaka is required')).toBeVisible()
})

test('complete profile: preview, JSON export, prompt download and copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await createClient(page, { complete: true })
  await expect(page.getByText('Complete', { exact: true })).toBeVisible()
  await expect(page.getByText('Ready to export')).toBeVisible()
  await expect(page.getByText('Kantha Heavyweight Tee', { exact: true })).toBeVisible()

  // EXPORT CLIENT JSON
  const [jsonDl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export Client JSON' }).click()])
  expect(jsonDl.suggestedFilename()).toMatch(/^nokshi-wear-\d{4}-\d{2}-\d{2}-client-data\.json$/)
  const json = JSON.parse(await readFile((await jsonDl.path())!, 'utf8'))
  expect(json.schema).toBe('khoka-tech/clothing-client-profile')
  expect(json.brand.name).toBe('Nokshi Wear')
  expect(json.brand.contact.whatsapp).toBe('8801700000000')
  expect(json.products).toHaveLength(2)
  expect(json.products[0]).toMatchObject({ name: 'Kantha Heavyweight Tee', regularPrice: 1500, discountPrice: 1290, sizes: ['M', 'L', 'XL'], featured: true })
  expect(json.products[0].images).toHaveLength(2)
  expect(json.orderAndDelivery).toMatchObject({ deliveryChargeInsideDhaka: 80, deliveryChargeOutsideDhaka: 150, freeDeliveryThreshold: 2500 })
  expect(json.features.requested).toContain('Payment Gateway')
  expect(json.features.requiresBackend.map((f: { feature: string }) => f.feature)).toContain('Payment Gateway')

  // DOWNLOAD CLAUDE DEVELOPMENT PROMPT
  const [txtDl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download Claude Prompt' }).click()])
  expect(txtDl.suggestedFilename()).toMatch(/claude-prompt\.txt$/)
  const prompt = await readFile((await txtDl.path())!, 'utf8')
  for (const must of [
    'NOKSHI WEAR',
    'NEVER reuse URBAN THREADS branding',
    'Do NOT leave any demo/sample/placeholder products',
    'Do NOT invent missing business information',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'Regular price: ৳1,500 (BDT)',
    'Discount price: ৳1,290 (BDT)',
    'Delivery charge outside Dhaka: ৳150 (BDT)',
    'https://wa.me/8801700000000?text=ENCODED_MESSAGE',
    'Payment Gateway (requires backend)',
    'Do NOT claim any feature works unless you have actually implemented and tested it',
    '## CLIENT DATA (JSON)',
  ]) expect(prompt, `prompt should contain: ${must}`).toContain(must)

  // COPY CLAUDE PROMPT
  await page.getByRole('button', { name: 'Copy Claude Prompt' }).first().click()
  await expect(page.getByText('Claude prompt copied')).toBeVisible()
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toContain('# DEVELOPMENT BRIEF — NOKSHI WEAR')
})

test('import JSON round-trip, duplicate, search and delete', async ({ page }) => {
  await createClient(page, { complete: true })
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export Client JSON' }).click()])
  const file = (await dl.path())!

  // IMPORT CLIENT JSON (same profile already exists → added as a copy, never overwritten)
  await page.locator('input[type=file]').setInputFiles({ name: 'client.json', mimeType: 'application/json', buffer: await readFile(file) })
  await expect(page.getByRole('heading', { level: 1, name: 'Nokshi Wear (Imported)' })).toBeVisible()
  await expect(page.getByText('Complete', { exact: true })).toBeVisible()

  // invalid file shows an error
  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"oops": ') })
  await expect(page.getByText('This file is not valid JSON.')).toBeVisible()

  await page.goto('/#/studio/clients')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2)
  await page.getByRole('button', { name: 'Duplicate' }).first().click()
  await expect(page.getByRole('main').getByRole('listitem').filter({ hasText: '(Copy)' })).toHaveCount(1)
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(3)

  await page.getByLabel('Search client projects').fill('Copy')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(1)
  await page.getByLabel('Search client projects').fill('')

  await page.getByRole('button', { name: 'Delete' }).first().click()
  const confirm = page.getByRole('dialog', { name: 'Delete client profile?' })
  await expect(confirm).toContainText('cannot be undone')
  await confirm.getByRole('button', { name: 'Delete permanently' }).click()
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2)
})

test('edit an existing profile and data survives a reload', async ({ page }) => {
  await createClient(page, { complete: false })
  await page.getByRole('button', { name: 'Edit Client Information' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit: Nokshi Wear')
  await page.getByLabel(/^Brand Email/).fill('hello@nokshi.example')
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await page.reload()
  await expect(page.getByLabel(/^Brand Email/)).toHaveValue('hello@nokshi.example')
})
