import { expect, type Page } from '@playwright/test'

/** Fails the test on any console error or uncaught page error. */
export function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return {
    errors,
    expectNone: () => expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]),
  }
}

/** Skip the one-time brand intro and start every test with empty storage. */
export async function freshStart(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_init')) {
      localStorage.clear()
      sessionStorage.setItem('__e2e_init', '1')
    }
    sessionStorage.setItem('ut-intro', '1')
  })
}

/** Replace window.open so WhatsApp links are captured instead of opened. */
export async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    ;(window as unknown as { __opened: string[] }).__opened = []
    window.open = ((url?: string | URL) => {
      ;(window as unknown as { __opened: string[] }).__opened.push(String(url))
      return null
    }) as typeof window.open
  })
}

export const openedUrls = (page: Page) => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)

export const STORE_ROUTES = ['/', '/shop', '/product/washed-denim-jacket', '/cart', '/about', '/contact', '/faq', '/does-not-exist']
export const STUDIO_ROUTES = ['/studio', '/studio/clients', '/studio/new', '/studio/guide']
