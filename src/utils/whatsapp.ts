import type { CartItem, CheckoutDetails } from '../types/store'
import { storeConfig } from '../data/storeConfig'
import { formatBDT } from './format'

export interface OrderTotals {
  subtotal: number
  delivery: number
  total: number
  itemCount: number
}

export function calcDelivery(subtotal: number, area: CheckoutDetails['area']) {
  if (subtotal <= 0) return 0
  if (subtotal >= storeConfig.delivery.freeThreshold) return 0
  return area === 'inside' ? storeConfig.delivery.insideDhaka : storeConfig.delivery.outsideDhaka
}

export function calcTotals(items: CartItem[], area: CheckoutDetails['area']): OrderTotals {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const delivery = calcDelivery(subtotal, area)
  return { subtotal, delivery, total: subtotal + delivery, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
}

/** Bangladeshi mobile: 01XXXXXXXXX (11 digits), optionally prefixed with +88 / 88. */
export function isValidBDPhone(phone: string) {
  const digits = phone.replace(/[\s-]/g, '')
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(digits)
}

export function buildOrderMessage(items: CartItem[], d: CheckoutDetails, orderRef: string) {
  const t = calcTotals(items, d.area)
  const lines: string[] = []
  lines.push(`🛍️ *NEW ORDER — ${storeConfig.brandName}*`)
  lines.push(`Order Ref: ${orderRef}`)
  lines.push('')
  lines.push('*Customer Details*')
  lines.push(`Name: ${d.name.trim()}`)
  lines.push(`Phone: ${d.phone.trim()}`)
  lines.push(`Address: ${d.address.trim()}`)
  lines.push(`Delivery Area: ${d.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}`)
  lines.push('')
  lines.push('*Order Items*')
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name}`)
    lines.push(`   Size: ${item.size} | Color: ${item.color}`)
    lines.push(`   Qty: ${item.quantity} × ${formatBDT(item.unitPrice)} = ${formatBDT(item.unitPrice * item.quantity)}`)
  })
  lines.push('')
  lines.push(`Items: ${t.itemCount}`)
  lines.push(`Subtotal: ${formatBDT(t.subtotal)}`)
  lines.push(`Delivery: ${t.delivery === 0 ? 'FREE' : formatBDT(t.delivery)}`)
  lines.push(`*Total: ${formatBDT(t.total)}*`)
  lines.push('Payment: Cash on Delivery')
  if (d.notes.trim()) {
    lines.push('')
    lines.push(`*Notes:* ${d.notes.trim()}`)
  }
  lines.push('')
  lines.push('Please confirm my order. Thank you!')
  return lines.join('\n')
}

/** https://wa.me/WHATSAPP_NUMBER?text=ENCODED_MESSAGE */
export function buildWhatsAppUrl(message: string, number = storeConfig.whatsappNumber) {
  const n = number.replace(/\D/g, '')
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

export const newOrderRef = () => `UT-${Date.now().toString(36).toUpperCase().slice(-6)}`
