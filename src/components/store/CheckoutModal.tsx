import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Copy, ExternalLink, Info } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CheckoutDetails } from '../../types/store'
import { useCart } from '../../context/CartContext'
import { useOrders } from '../../context/OrdersContext'
import { useToast } from '../../context/ToastContext'
import { storeConfig } from '../../data/storeConfig'
import { copyText } from '../../utils/download'
import { cn, formatBDT } from '../../utils/format'
import { buildOrderMessage, buildWhatsAppUrl, calcTotals, isValidBDPhone, newOrderRef } from '../../utils/whatsapp'
import { readStorage, writeStorage } from '../../utils/storage'
import { WhatsappIcon } from '../ui/BrandIcons'
import { Modal } from '../ui/Modal'

const DETAILS_KEY = 'urban-threads:checkout-details:v1'
const empty: CheckoutDetails = { name: '', phone: '', address: '', area: 'inside', notes: '' }
type Errors = Partial<Record<keyof CheckoutDetails, string>>

function validate(d: CheckoutDetails): Errors {
  const e: Errors = {}
  if (d.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!isValidBDPhone(d.phone)) e.phone = 'Enter a valid Bangladeshi mobile number, e.g. 01712345678.'
  if (d.address.trim().length < 8) e.address = 'Please enter a complete delivery address.'
  return e
}

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, clear } = useCart()
  const { createOrder, deleteOrder, orders } = useOrders()
  // the order recorded for this checkout; re-sending after "Edit details" replaces it instead of duplicating
  const recordedId = useRef<string | null>(null)
  const { notify } = useToast()
  // remember name/phone/address on this device for convenience (no passwords or payment data are ever stored)
  const [d, setD] = useState<CheckoutDetails>(() => ({ ...empty, ...readStorage<Partial<CheckoutDetails>>(DETAILS_KEY, {}), notes: '' }))
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<null | { url: string; message: string }>(null)
  const [orderRef, setOrderRef] = useState(newOrderRef)

  useEffect(() => {
    if (open) {
      setSent(null)
      setErrors({})
      setOrderRef(newOrderRef())
      recordedId.current = null
    }
  }, [open])

  const totals = useMemo(() => calcTotals(items, d.area), [items, d.area])
  const message = useMemo(() => buildOrderMessage(items, d, orderRef), [items, d, orderRef])

  const set = <K extends keyof CheckoutDetails>(k: K, v: CheckoutDetails[K]) => {
    setD((prev) => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(d)
    setErrors(errs)
    if (Object.keys(errs).length) {
      notify('error', 'Please check your details', 'Some required fields need attention.')
      return
    }
    if (!items.length) {
      notify('error', 'Your cart is empty')
      return
    }
    writeStorage(DETAILS_KEY, { name: d.name, phone: d.phone, address: d.address, area: d.area })
    const url = buildWhatsAppUrl(message)
    window.open(url, '_blank', 'noopener,noreferrer')
    // record the order (status: pending) so the shop owner sees it in Admin → Orders and the shopper can track it
    const prev = recordedId.current ? orders.find((o) => o.id === recordedId.current) : undefined
    if (prev && prev.status === 'pending') deleteOrder(prev.id)
    const order = createOrder(
      {
        ref: orderRef,
        source: 'website',
        customer: { name: d.name.trim(), phone: d.phone.trim(), address: d.address.trim(), area: d.area },
        notes: d.notes.trim(),
        items: items.map(({ productId, slug, name, image, unitPrice, size, color, quantity }) => ({ productId, slug, name, image, unitPrice, size, color, quantity })),
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
      },
      { mine: true },
    )
    recordedId.current = order.id
    setSent({ url, message })
  }

  const finish = () => {
    clear()
    onClose()
    notify('success', 'Thank you for your order!', 'We will confirm it on WhatsApp shortly.')
  }

  const field = 'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition placeholder:text-neutral-400 focus:border-ink focus:ring-2 focus:ring-ink/10 focus:outline-none'

  return (
    <Modal open={open} onClose={onClose} title={sent ? 'Complete your order on WhatsApp' : 'Order via WhatsApp'} description={sent ? `Order ref ${orderRef}` : 'Cash on Delivery · We confirm every order in chat'} size="lg">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">WhatsApp opened with your order message.</p>
                <p className="mt-1 text-emerald-800">Press <strong>Send</strong> in WhatsApp to place the order. If WhatsApp did not open, use the button below or copy the message.</p>
              </div>
            </div>
            <pre className="max-h-64 overflow-auto rounded-xl bg-ivory p-4 text-xs leading-relaxed whitespace-pre-wrap text-neutral-700">{sent.message}</pre>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={sent.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-white transition hover:brightness-95">
                <ExternalLink className="h-4 w-4" /> Open WhatsApp again
              </a>
              <button
                onClick={async () => {
                  if (await copyText(sent.message)) notify('success', 'Order message copied')
                  else notify('error', 'Could not copy', 'Please select the text above and copy it manually.')
                }}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 text-sm font-semibold transition hover:border-ink"
              >
                <Copy className="h-4 w-4" /> Copy message
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-black/8 pt-4 sm:flex-row sm:justify-between">
              <div className="flex gap-1">
                <button onClick={() => setSent(null)} className="h-11 rounded-lg px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
                  Edit details
                </button>
                <Link to="/orders" onClick={onClose} className="inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
                  Track order
                </Link>
              </div>
              <button onClick={finish} className="h-11 rounded-lg bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink-3">
                I've sent it — clear my cart
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <label htmlFor="co-name" className="mb-1.5 block text-sm font-medium">Full name <span className="text-red-600">*</span></label>
                <input id="co-name" data-autofocus autoComplete="name" value={d.name} onChange={(e) => set('name', e.target.value)} className={cn(field, errors.name ? 'border-red-500' : 'border-neutral-300')} placeholder="Your full name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'co-name-e' : undefined} />
                {errors.name && <p id="co-name-e" className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className="mb-1.5 block text-sm font-medium">Phone number <span className="text-red-600">*</span></label>
                <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set('phone', e.target.value)} className={cn(field, errors.phone ? 'border-red-500' : 'border-neutral-300')} placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'co-phone-e' : undefined} />
                {errors.phone && <p id="co-phone-e" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="co-address" className="mb-1.5 block text-sm font-medium">Delivery address <span className="text-red-600">*</span></label>
                <textarea id="co-address" rows={3} autoComplete="street-address" value={d.address} onChange={(e) => set('address', e.target.value)} className={cn(field, 'resize-none', errors.address ? 'border-red-500' : 'border-neutral-300')} placeholder="House, road, area, city" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'co-address-e' : undefined} />
                {errors.address && <p id="co-address-e" className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium">Delivery area</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['inside', 'outside'] as const).map((a) => (
                    <label key={a} className={cn('flex cursor-pointer items-center justify-between rounded-lg border px-3.5 py-3 text-sm transition', d.area === a ? 'border-ink bg-ivory' : 'border-neutral-300 hover:border-neutral-500')}>
                      <span className="flex items-center gap-2">
                        <input type="radio" name="area" value={a} checked={d.area === a} onChange={() => set('area', a)} className="accent-ink" />
                        {a === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                      </span>
                      <span className="text-xs text-neutral-500">{formatBDT(a === 'inside' ? storeConfig.delivery.insideDhaka : storeConfig.delivery.outsideDhaka)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="co-notes" className="mb-1.5 block text-sm font-medium">Order notes <span className="font-normal text-neutral-400">(optional)</span></label>
                <textarea id="co-notes" rows={2} value={d.notes} onChange={(e) => set('notes', e.target.value)} className={cn(field, 'resize-none border-neutral-300')} placeholder="Preferred delivery time, landmark, gift note…" />
              </div>
            </div>

            <aside className="flex flex-col rounded-xl bg-ivory p-4">
              <p className="eyebrow text-neutral-500">Order summary</p>
              <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                {items.map((i) => (
                  <li key={i.key} className="flex gap-3 text-sm">
                    <img src={i.image} alt="" className="h-14 w-11 shrink-0 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.name}</p>
                      <p className="text-xs text-neutral-500">{i.size} · {i.color} · ×{i.quantity}</p>
                    </div>
                    <p className="font-medium tabular-nums">{formatBDT(i.unitPrice * i.quantity)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-black/10 pt-3 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd className="tabular-nums">{formatBDT(totals.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-600">Delivery</dt><dd className="tabular-nums">{totals.delivery === 0 ? 'FREE' : formatBDT(totals.delivery)}</dd></div>
                <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatBDT(totals.total)}</dd></div>
              </dl>
              {!storeConfig.whatsappNumber && (
                <p className="mt-3 flex gap-1.5 text-[11px] leading-snug text-neutral-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Demo mode: no business number is configured, so WhatsApp will ask you to pick a chat.
                </p>
              )}
              <button type="submit" className="group mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-10px_rgba(37,211,102,0.85)] active:translate-y-0">
                <WhatsappIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Send Order on WhatsApp
              </button>
            </aside>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  )
}
