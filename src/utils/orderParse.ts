import type { DeliveryArea, OrderItem, Product } from '../types/store'

export interface ParsedOrder {
  ref: string
  customer: { name: string; phone: string; address: string; area: DeliveryArea }
  notes: string
  items: OrderItem[]
  subtotal: number | null
  delivery: number | null
  total: number | null
  /** item names that did not match a product in the catalog (kept, but without stock tracking) */
  unmatched: string[]
}

const money = (s: string | undefined) => {
  if (!s) return null
  if (/free/i.test(s)) return 0
  const n = Number(s.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && s.match(/\d/) ? n : null
}
// a line such as "Name: Rahim" or "*Notes:* call first" (WhatsApp bold markers are optional)
const field = (text: string, label: string) => text.match(new RegExp('^\\*?' + label + ':\\*?\\s*(.+)$', 'im'))?.[1]?.replace(/\*/g, '').trim() ?? ''

/**
 * Reads an order message produced by this store's WhatsApp checkout (the customer sends it to the
 * business number; the admin pastes it here). Tolerant of WhatsApp's bold markers and extra spaces.
 * Returns null when the text has no recognisable order items.
 */
export function parseWhatsAppOrder(text: string, catalog: Product[]): ParsedOrder | null {
  const t = text.replace(/\r/g, '')
  const lines = t.split('\n').map((l) => l.trim())
  const items: OrderItem[] = []
  const unmatched: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^(\d+)\.\s+(.+)$/)
    if (!head) continue
    const name = head[2].replace(/\*/g, '').trim()
    const opts = lines[i + 1]?.match(/Size:\s*([^|]+?)\s*\|\s*Colou?r:\s*(.+)$/i)
    const qty = lines[i + 2]?.match(/Qty:\s*(\d+)\s*[×x]\s*([^=]+)=/i)
    if (!opts || !qty) continue
    const product = catalog.find((p) => p.name.toLowerCase() === name.toLowerCase())
    if (!product) unmatched.push(name)
    items.push({
      productId: product?.id ?? '',
      slug: product?.slug ?? '',
      name,
      image: product?.images[0] ?? '',
      size: opts[1].trim(),
      color: opts[2].trim(),
      quantity: Number(qty[1]),
      unitPrice: money(qty[2]) ?? 0,
    })
    i += 2
  }
  if (!items.length) return null

  const areaText = field(t, 'Delivery Area')
  return {
    ref: field(t, 'Order Ref'),
    customer: {
      name: field(t, 'Name'),
      phone: field(t, 'Phone'),
      address: field(t, 'Address'),
      area: /outside/i.test(areaText) ? 'outside' : 'inside',
    },
    notes: field(t, 'Notes'),
    items,
    subtotal: money(field(t, 'Subtotal')),
    delivery: money(field(t, 'Delivery')),
    total: money(field(t, 'Total')),
    unmatched,
  }
}
