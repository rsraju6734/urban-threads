import type { ClientProduct, ClientProfile } from '../../types/studio'

export type SectionId = 'brand' | 'design' | 'products' | 'features' | 'order' | 'additional'

export interface Issue {
  section: SectionId
  /** dotted path used to highlight the field, e.g. "brand.brandName" or "products.<id>.name" */
  field: string
  message: string
  /** errors block "complete" status; warnings are informational */
  level: 'error' | 'warning'
}

const isUrl = (s: string) => {
  try {
    const u = new URL(s.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
const isHex = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim())
export const digits = (s: string) => s.replace(/\D/g, '')
export const toNumber = (s: string): number | null => {
  if (s === undefined || s === null || String(s).trim() === '') return null
  const n = Number(String(s).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}
export const splitList = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)

export function productIssues(p: ClientProduct, index: number): Issue[] {
  const out: Issue[] = []
  const label = p.name.trim() || `Product ${index + 1}`
  const f = (k: string) => `products.${p.id}.${k}`
  if (!p.name.trim()) out.push({ section: 'products', field: f('name'), message: `${label}: product name is required`, level: 'error' })
  if (!p.category.trim()) out.push({ section: 'products', field: f('category'), message: `${label}: category is required`, level: 'error' })
  const reg = toNumber(p.regularPrice)
  if (reg === null || reg <= 0) out.push({ section: 'products', field: f('regularPrice'), message: `${label}: enter a regular price greater than 0`, level: 'error' })
  const disc = toNumber(p.discountPrice)
  if (p.discountPrice.trim() && (disc === null || disc <= 0)) out.push({ section: 'products', field: f('discountPrice'), message: `${label}: discount price must be a positive number`, level: 'error' })
  if (disc !== null && reg !== null && disc >= reg) out.push({ section: 'products', field: f('discountPrice'), message: `${label}: discount price must be lower than the regular price`, level: 'error' })
  const stock = toNumber(p.stock)
  if (p.stock.trim() && (stock === null || stock < 0 || !Number.isInteger(stock))) out.push({ section: 'products', field: f('stock'), message: `${label}: stock must be a whole number`, level: 'error' })
  const imgs = p.imageUrls.map((u) => u.trim()).filter(Boolean)
  if (!imgs.length) out.push({ section: 'products', field: f('imageUrls'), message: `${label}: add at least one image URL`, level: 'error' })
  imgs.forEach((u) => {
    if (!isUrl(u)) out.push({ section: 'products', field: f('imageUrls'), message: `${label}: "${u.slice(0, 40)}" is not a valid http(s) image URL`, level: 'error' })
  })
  if (!p.description.trim()) out.push({ section: 'products', field: f('description'), message: `${label}: no description provided`, level: 'warning' })
  if (!splitList(p.sizes).length) out.push({ section: 'products', field: f('sizes'), message: `${label}: no sizes listed`, level: 'warning' })
  if (!splitList(p.colors).length) out.push({ section: 'products', field: f('colors'), message: `${label}: no colors listed`, level: 'warning' })
  return out
}

export function validateProfile(p: ClientProfile): Issue[] {
  const out: Issue[] = []
  const b = p.brand
  if (!b.brandName.trim()) out.push({ section: 'brand', field: 'brand.brandName', message: 'Brand name is required', level: 'error' })
  if (!b.description.trim()) out.push({ section: 'brand', field: 'brand.description', message: 'Business description is required', level: 'error' })
  const wa = digits(b.whatsapp)
  if (!wa) out.push({ section: 'brand', field: 'brand.whatsapp', message: 'WhatsApp number is required for ordering', level: 'error' })
  else if (wa.length < 10 || wa.length > 15) out.push({ section: 'brand', field: 'brand.whatsapp', message: 'WhatsApp number should be 10–15 digits in international format (e.g. 8801XXXXXXXXX)', level: 'error' })
  if (b.email.trim() && !isEmail(b.email)) out.push({ section: 'brand', field: 'brand.email', message: 'Brand email is not a valid email address', level: 'error' })
  ;(['logoUrl', 'facebook', 'instagram', 'tiktok'] as const).forEach((k) => {
    if (b[k].trim() && !isUrl(b[k])) out.push({ section: 'brand', field: `brand.${k}`, message: `${k === 'logoUrl' ? 'Logo URL' : k[0].toUpperCase() + k.slice(1) + ' URL'} must start with http:// or https://`, level: 'error' })
  })
  if (!b.logoUrl.trim()) out.push({ section: 'brand', field: 'brand.logoUrl', message: 'No logo URL — the developer will create a text wordmark', level: 'warning' })
  if (!b.tagline.trim()) out.push({ section: 'brand', field: 'brand.tagline', message: 'No tagline provided', level: 'warning' })
  if (!b.facebook.trim() && !b.instagram.trim() && !b.tiktok.trim()) out.push({ section: 'brand', field: 'brand.facebook', message: 'No social media links provided', level: 'warning' })

  const d = p.design
  ;(['primaryColor', 'secondaryColor', 'backgroundColor'] as const).forEach((k) => {
    if (!isHex(d[k])) out.push({ section: 'design', field: `design.${k}`, message: `${k.replace('Color', ' color')} must be a hex value like #111111`, level: 'error' })
  })
  if (!d.styles.length) out.push({ section: 'design', field: 'design.styles', message: 'No design style selected', level: 'warning' })
  splitList(d.referenceUrls).forEach((u) => {
    if (!isUrl(u)) out.push({ section: 'design', field: 'design.referenceUrls', message: `Reference "${u.slice(0, 40)}" is not a valid URL`, level: 'error' })
  })

  if (!p.products.length) out.push({ section: 'products', field: 'products', message: 'Add at least one product', level: 'error' })
  p.products.forEach((prod, i) => out.push(...productIssues(prod, i)))

  if (!Object.values(p.features).some(Boolean)) out.push({ section: 'features', field: 'features', message: 'Select at least one website feature', level: 'error' })

  const o = p.order
  ;(['deliveryInsideDhaka', 'deliveryOutsideDhaka', 'freeDeliveryThreshold'] as const).forEach((k) => {
    const v = o[k]
    if (v.trim() && (toNumber(v) === null || (toNumber(v) as number) < 0)) out.push({ section: 'order', field: `order.${k}`, message: 'Delivery amounts must be numbers (BDT)', level: 'error' })
  })
  if (!o.deliveryInsideDhaka.trim()) out.push({ section: 'order', field: 'order.deliveryInsideDhaka', message: 'Delivery charge inside Dhaka is required', level: 'error' })
  if (!o.deliveryOutsideDhaka.trim()) out.push({ section: 'order', field: 'order.deliveryOutsideDhaka', message: 'Delivery charge outside Dhaka is required', level: 'error' })
  const orderWa = digits(o.whatsappOrderNumber)
  if (orderWa && (orderWa.length < 10 || orderWa.length > 15)) out.push({ section: 'order', field: 'order.whatsappOrderNumber', message: 'WhatsApp order number should be 10–15 digits', level: 'error' })
  if (!o.paymentMethods.length && !o.cashOnDelivery) out.push({ section: 'order', field: 'order.paymentMethods', message: 'Select at least one payment method', level: 'error' })
  if (!o.returnPolicy.trim()) out.push({ section: 'order', field: 'order.returnPolicy', message: 'No return policy provided', level: 'warning' })
  if (!o.estimatedDelivery.trim()) out.push({ section: 'order', field: 'order.estimatedDelivery', message: 'No estimated delivery time provided', level: 'warning' })

  return out
}

export const isComplete = (p: ClientProfile) => !validateProfile(p).some((i) => i.level === 'error')

export function completionPercent(p: ClientProfile) {
  const checks = [
    !!p.brand.brandName.trim(),
    !!p.brand.description.trim(),
    !!digits(p.brand.whatsapp),
    !!p.brand.logoUrl.trim(),
    !!(p.brand.facebook || p.brand.instagram || p.brand.tiktok).trim(),
    p.design.styles.length > 0,
    p.products.length > 0 && p.products.every((x, i) => productIssues(x, i).every((iss) => iss.level !== 'error')),
    Object.values(p.features).some(Boolean),
    !!p.order.deliveryInsideDhaka.trim() && !!p.order.deliveryOutsideDhaka.trim(),
    !!p.order.returnPolicy.trim() || !!p.order.exchangePolicy.trim(),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
