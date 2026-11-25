/**
 * Central storefront configuration.
 *
 * Defaults live here. The Admin panel (Settings) can override the WhatsApp number, contact details,
 * delivery charges and social links; overrides are saved in this browser's localStorage and applied
 * when the app starts (and immediately when saved).
 *
 * WHATSAPP NUMBER: international format, digits only (e.g. 8801XXXXXXXXX). It can also be provided as
 * VITE_WHATSAPP_NUMBER in a .env file. When it is empty, checkout opens WhatsApp with the message ready
 * and lets the customer choose the chat.
 */
const defaults = {
  brandName: 'URBAN THREADS',
  tagline: 'Premium Fashion. Timeless Style.',
  currencySymbol: '৳',
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, '') ?? '',
  email: 'hello@urbanthreads.example',
  address: 'Gulshan Avenue, Dhaka, Bangladesh (demo address)',
  hours: 'Sat – Thu, 10:00 AM – 9:00 PM',
  delivery: {
    insideDhaka: 70,
    outsideDhaka: 130,
    freeThreshold: 2000,
    estimate: 'Inside Dhaka 1–2 days · Outside Dhaka 3–5 days',
  },
  social: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
    tiktok: 'https://www.tiktok.com/',
  },
}

export type StoreSettings = typeof defaults
export const SETTINGS_KEY = 'urban-threads:settings:v1'

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o))

function readOverrides(): Partial<StoreSettings> {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(SETTINGS_KEY) : null
    return raw ? (JSON.parse(raw) as Partial<StoreSettings>) : {}
  } catch {
    return {}
  }
}

function merge(base: StoreSettings, o: Partial<StoreSettings>): StoreSettings {
  return {
    ...base,
    ...o,
    delivery: { ...base.delivery, ...(o.delivery ?? {}) },
    social: { ...base.social, ...(o.social ?? {}) },
  }
}

/** Live configuration object read by the storefront. */
export const storeConfig: StoreSettings = merge(clone(defaults), readOverrides())

export const defaultSettings = (): StoreSettings => clone(defaults)

/** Saves settings to this browser and applies them immediately. Returns false if storage is unavailable. */
export function saveStoreSettings(next: StoreSettings): boolean {
  const merged = merge(clone(defaults), next)
  Object.assign(storeConfig, merged)
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

export function resetStoreSettings() {
  Object.assign(storeConfig, clone(defaults))
  try {
    window.localStorage.removeItem(SETTINGS_KEY)
  } catch {
    /* ignore */
  }
}
