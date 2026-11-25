import { expect, test } from '@playwright/test'
import { freshStart, STORE_ROUTES, STUDIO_ROUTES } from './helpers'

/*
 * Layout checks borrowed from taste-skill's finish gate:
 * no sideways scroll at 390 and 320, and every control a thumb can hit (44px, WCAG 2.5.5).
 */
const WIDTHS = [390, 320]

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await freshStart(page)
    await page.setViewportSize({ width, height: 800 })
    const problems: string[] = []
    for (const r of [...STORE_ROUTES, ...STUDIO_ROUTES]) {
      await page.goto(`/#${r}`)
      await page.waitForTimeout(400)
      const res = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: window.innerWidth }))
      if (res.doc > width || res.vw > width) problems.push(`${r}: page is ${Math.max(res.doc, res.vw)}px wide at a ${width}px screen`)
    }
    expect(problems).toEqual([])
  })
}

test('tap targets are at least 44px on the storefront (390px)', async ({ page }) => {
  await freshStart(page)
  await page.setViewportSize({ width: 390, height: 844 })
  const small: string[] = []
  for (const r of ['/', '/shop', '/product/washed-denim-jacket', '/cart', '/contact', '/faq']) {
    await page.goto(`/#${r}`)
    await page.waitForTimeout(400)
    const found = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll<HTMLElement>('header button, header a, main button, [role=radio]').forEach((el) => {
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        if (!rect.width || !rect.height || style.visibility === 'hidden') return
        if (el.closest('p, li > a.link-underline, nav[aria-label=Breadcrumb]')) return // links inside running text
        if (Math.min(rect.width, rect.height) < 43.5) out.push(`${el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30)} (${Math.round(rect.width)}×${Math.round(rect.height)})`)
      })
      return out
    })
    small.push(...found.map((f) => `${r}: ${f}`))
  }
  expect(small, small.join('\n')).toEqual([])
})
