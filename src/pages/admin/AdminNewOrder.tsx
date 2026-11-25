import { AlertTriangle, ClipboardPaste, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, CardHeader, TextAreaField, TextField } from '../../components/studio/ui'
import { useCatalog } from '../../context/CatalogContext'
import { useOrders } from '../../context/OrdersContext'
import { useToast } from '../../context/ToastContext'
import { effectivePrice } from '../../data/products'
import type { DeliveryArea, OrderItem, OrderSource, OrderStatus } from '../../types/store'
import { cn, formatBDT } from '../../utils/format'
import { parseWhatsAppOrder } from '../../utils/orderParse'
import { calcDelivery, newOrderRef } from '../../utils/whatsapp'
import { PageHeader, inputCls } from './shared'

const blankItem = (): OrderItem => ({ productId: '', slug: '', name: '', image: '', unitPrice: 0, size: '', color: '', quantity: 1 })

export default function AdminNewOrder() {
  const { allProducts } = useCatalog()
  const { orders, createOrder } = useOrders()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [showPaste, setShowPaste] = useState(params.get('paste') === '1')
  const [pasted, setPasted] = useState('')
  const [source, setSource] = useState<OrderSource>('manual')
  const [ref, setRef] = useState(newOrderRef)
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', area: 'inside' as DeliveryArea })
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<OrderStatus>('pending')
  const [items, setItems] = useState<OrderItem[]>([blankItem()])
  const [deliveryOverride, setDeliveryOverride] = useState<string>('')
  const [tried, setTried] = useState(false)
  const [unmatched, setUnmatched] = useState<string[]>([])

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const autoDelivery = calcDelivery(subtotal, customer.area)
  const delivery = deliveryOverride.trim() !== '' && Number.isFinite(Number(deliveryOverride)) ? Number(deliveryOverride) : autoDelivery
  const duplicate = orders.find((o) => o.ref.toLowerCase() === ref.trim().toLowerCase())

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!customer.name.trim()) e.name = 'Enter the customer name.'
    if (customer.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a phone number.'
    if (!customer.address.trim()) e.address = 'Enter the delivery address.'
    if (!items.length || items.some((i) => !i.name || i.quantity < 1)) e.items = 'Every line needs a product and a quantity.'
    if (!ref.trim()) e.ref = 'Enter an order reference.'
    else if (duplicate) e.ref = `Order ${duplicate.ref} already exists.`
    return e
  }, [customer, items, ref, duplicate])
  const err = (k: string) => (tried ? errors[k] : undefined)

  const readMessage = () => {
    const parsed = parseWhatsAppOrder(pasted, allProducts)
    if (!parsed) {
      notify('error', 'No order found in this text', 'Paste the full order message the customer sent, starting with "NEW ORDER".')
      return
    }
    setSource('whatsapp')
    if (parsed.ref) setRef(parsed.ref)
    setCustomer(parsed.customer)
    setNotes(parsed.notes)
    setItems(parsed.items)
    setDeliveryOverride(parsed.delivery !== null ? String(parsed.delivery) : '')
    setUnmatched(parsed.unmatched)
    setShowPaste(false)
    notify('success', 'Order details filled in', `${parsed.items.length} item${parsed.items.length === 1 ? '' : 's'} read from the message. Check them, then save.`)
  }

  const setItem = (i: number, patch: Partial<OrderItem>) => setItems((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const pickProduct = (i: number, productId: string) => {
    const p = allProducts.find((x) => x.id === productId)
    if (!p) return setItem(i, blankItem())
    setItem(i, { productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? '', unitPrice: effectivePrice(p), size: p.sizes[0] ?? '', color: p.colors[0]?.name ?? '' })
  }

  const save = () => {
    setTried(true)
    if (Object.keys(errors).length) {
      notify('error', 'Please complete the order', Object.values(errors)[0])
      return
    }
    const o = createOrder({
      ref: ref.trim(),
      source,
      status,
      customer: { ...customer, name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim() },
      notes: notes.trim(),
      items,
      subtotal,
      delivery,
      total: subtotal + delivery,
    })
    notify('success', `Order ${o.ref} saved`, status === 'confirmed' ? 'Stock has been reduced.' : 'Status: Pending.')
    navigate(`/admin/orders/${o.id}`)
  }

  return (
    <>
      <PageHeader back={{ to: '/admin/orders', label: 'Orders' }} title="Add Order" sub="Record an order that came in on WhatsApp, by phone or in person." />

      <Card className="mb-6">
        <CardHeader
          title="Paste a WhatsApp order"
          description="When a customer sends the order from their own phone, it reaches you only on WhatsApp. Copy that message and paste it here to fill everything in."
          icon={<ClipboardPaste className="h-[18px] w-[18px]" />}
          action={!showPaste ? <Button className="h-11" onClick={() => setShowPaste(true)}>Paste message</Button> : undefined}
        />
        {showPaste && (
          <div className="space-y-3 p-5 sm:p-6">
            <TextAreaField label="Order message" rows={8} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={'🛍️ *NEW ORDER — URBAN THREADS*\nOrder Ref: UT-…\n…'} />
            <div className="flex gap-2">
              <Button variant="primary" className="h-11 !bg-ink hover:!bg-ink-3" onClick={readMessage} disabled={!pasted.trim()}>Read order</Button>
              <Button variant="ghost" className="h-11" onClick={() => setShowPaste(false)}>Close</Button>
            </div>
          </div>
        )}
      </Card>

      {unmatched.length > 0 && (
        <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>Not found in your products: <strong>{unmatched.join(', ')}</strong>. These lines are kept, but stock will not change for them. Pick the matching product if it was renamed.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <TextField label="Name" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} error={err('name')} />
              <TextField label="Phone" required type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} error={err('phone')} placeholder="01XXXXXXXXX" />
              <TextAreaField className="sm:col-span-2" label="Delivery address" required rows={2} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} error={err('address')} />
              <fieldset className="sm:col-span-2">
                <legend className="mb-1.5 text-[13px] font-medium text-neutral-700">Delivery area</legend>
                <div className="flex gap-2">
                  {(['inside', 'outside'] as const).map((a) => (
                    <label key={a} className={cn('flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm', customer.area === a ? 'border-ink bg-black/[0.03]' : 'border-black/12')}>
                      <input type="radio" name="area" checked={customer.area === a} onChange={() => setCustomer({ ...customer, area: a })} />
                      {a === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <TextAreaField className="sm:col-span-2" label="Customer notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Items" action={<Button className="h-11" icon={<Plus className="h-4 w-4" />} onClick={() => setItems([...items, blankItem()])}>Add item</Button>} />
            <ul className="divide-y divide-black/[0.06]">
              {items.map((it, i) => {
                const p = allProducts.find((x) => x.id === it.productId)
                return (
                  <li key={i} className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_80px_110px_44px] sm:items-end">
                    <label className="text-[13px] font-medium text-neutral-700">
                      Product
                      <select value={it.productId} onChange={(e) => pickProduct(i, e.target.value)} className={cn(inputCls, 'mt-1.5', err('items') && !it.name && 'border-red-500')} aria-label={`Item ${i + 1} product`}>
                        <option value="">{it.name && !it.productId ? `${it.name} (not in catalog)` : 'Choose a product…'}</option>
                        {allProducts.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.stock} in stock)</option>)}
                      </select>
                    </label>
                    <label className="text-[13px] font-medium text-neutral-700">
                      Size
                      {p ? (
                        <select value={it.size} onChange={(e) => setItem(i, { size: e.target.value })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} size`}>{p.sizes.map((s) => <option key={s}>{s}</option>)}</select>
                      ) : (
                        <input value={it.size} onChange={(e) => setItem(i, { size: e.target.value })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} size`} />
                      )}
                    </label>
                    <label className="text-[13px] font-medium text-neutral-700">
                      Colour
                      {p ? (
                        <select value={it.color} onChange={(e) => setItem(i, { color: e.target.value })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} colour`}>{p.colors.map((c) => <option key={c.name}>{c.name}</option>)}</select>
                      ) : (
                        <input value={it.color} onChange={(e) => setItem(i, { color: e.target.value })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} colour`} />
                      )}
                    </label>
                    <label className="text-[13px] font-medium text-neutral-700">
                      Qty
                      <input type="number" min={1} value={it.quantity} onChange={(e) => setItem(i, { quantity: Math.max(1, Number(e.target.value) || 1) })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} quantity`} />
                    </label>
                    <label className="text-[13px] font-medium text-neutral-700">
                      Unit price ৳
                      <input type="number" min={0} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Math.max(0, Number(e.target.value) || 0) })} className={cn(inputCls, 'mt-1.5')} aria-label={`Item ${i + 1} unit price`} />
                    </label>
                    <button type="button" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [blankItem()])} className="grid h-11 w-11 place-items-center rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600" aria-label={`Remove item ${i + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
            {err('items') && <p className="px-4 pb-4 text-xs text-red-600">{err('items')}</p>}
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Summary" />
            <div className="space-y-4 p-5">
              <TextField label="Order reference" value={ref} onChange={(e) => setRef(e.target.value)} error={err('ref')} />
              <fieldset>
                <legend className="mb-1.5 text-[13px] font-medium text-neutral-700">Starting status</legend>
                <div className="flex gap-2">
                  {(['pending', 'confirmed'] as const).map((s) => (
                    <label key={s} className={cn('flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm capitalize', status === s ? 'border-ink bg-black/[0.03]' : 'border-black/12')}>
                      <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} /> {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <TextField label="Delivery charge (৳)" inputMode="numeric" value={deliveryOverride} onChange={(e) => setDeliveryOverride(e.target.value)} placeholder={`${autoDelivery} (automatic)`} hint="Leave empty to use your delivery settings." />
              <dl className="space-y-1.5 border-t border-black/[0.06] pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd className="tabular-nums">{formatBDT(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-600">Delivery</dt><dd className="tabular-nums">{delivery === 0 ? 'Free' : formatBDT(delivery)}</dd></div>
                <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatBDT(subtotal + delivery)}</dd></div>
              </dl>
              <Button variant="primary" className="h-11 w-full !bg-ink hover:!bg-ink-3" icon={<Save className="h-4 w-4" />} onClick={save}>Save Order</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
