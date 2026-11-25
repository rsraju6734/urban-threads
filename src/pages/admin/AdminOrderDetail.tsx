import { Ban, CheckCircle2, MapPin, PackageCheck, Phone, RotateCcw, Save, StickyNote, Trash2, Truck, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OrderProgress, OrderStatusBadge } from '../../components/store/OrderStatus'
import { ConfirmDialog } from '../../components/studio/actions'
import { Button, Card, CardHeader } from '../../components/studio/ui'
import { WhatsappIcon } from '../../components/ui/BrandIcons'
import { STATUS_LABEL, useOrders } from '../../context/OrdersContext'
import { useToast } from '../../context/ToastContext'
import { storeConfig } from '../../data/storeConfig'
import type { Order, OrderStatus } from '../../types/store'
import { formatBDT, formatDateTime } from '../../utils/format'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import { AdminNotFound, PageHeader } from './shared'

/** The next steps the admin can take from each status. */
const ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string; Icon: typeof CheckCircle2; tone: 'primary' | 'secondary' | 'danger' }[]> = {
  pending: [
    { to: 'confirmed', label: 'Confirm Order', Icon: CheckCircle2, tone: 'primary' },
    { to: 'cancelled', label: 'Cancel Order', Icon: Ban, tone: 'danger' },
  ],
  confirmed: [
    { to: 'shipped', label: 'Mark as Shipped', Icon: Truck, tone: 'primary' },
    { to: 'pending', label: 'Back to Pending', Icon: RotateCcw, tone: 'secondary' },
    { to: 'cancelled', label: 'Cancel Order', Icon: Ban, tone: 'danger' },
  ],
  shipped: [
    { to: 'delivered', label: 'Mark as Delivered', Icon: PackageCheck, tone: 'primary' },
    { to: 'cancelled', label: 'Cancel Order', Icon: Ban, tone: 'danger' },
  ],
  delivered: [],
  cancelled: [{ to: 'pending', label: 'Reopen as Pending', Icon: RotateCcw, tone: 'secondary' }],
}

const customerMessage = (o: Order) => {
  const hi = `Hello ${o.customer.name.split(' ')[0] || 'there'}, this is ${storeConfig.brandName} about order ${o.ref}.`
  switch (o.status) {
    case 'pending': return `${hi} We received your order (total ${formatBDT(o.total)}). Can you confirm the details so we can process it?`
    case 'confirmed': return `${hi} Your order is confirmed. Total ${formatBDT(o.total)}, cash on delivery. We will let you know when it ships.`
    case 'shipped': return `${hi} Your order has been shipped and is on its way. ${storeConfig.delivery.estimate}.`
    case 'delivered': return `${hi} Your order has been delivered. Thank you for shopping with us!`
    case 'cancelled': return `${hi} Your order has been cancelled. Please reply if you have any questions.`
  }
}

export default function AdminOrderDetail() {
  const { id = '' } = useParams()
  const { orders } = useOrders()
  const order = orders.find((o) => o.id === id)
  if (!order) return <AdminNotFound title="Order not found" text="It may have been deleted." />
  return <Detail o={order} />
}

function Detail({ o }: { o: Order }) {
  const { setStatus, updateOrder, deleteOrder } = useOrders()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [note, setNote] = useState(o.adminNote)
  const [confirm, setConfirm] = useState<null | { to: OrderStatus; label: string }>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => setNote(o.adminNote), [o.adminNote])

  const phoneDigits = o.customer.phone.replace(/\D/g, '')
  const waNumber = phoneDigits.startsWith('880') ? phoneDigits : phoneDigits.startsWith('0') ? `88${phoneDigits}` : phoneDigits

  const change = (to: OrderStatus) => {
    setStatus(o.id, to)
    notify('success', `Order ${o.ref}: ${STATUS_LABEL[to]}`, to === 'confirmed' ? 'Stock has been reduced for the items in this order.' : to === 'cancelled' && o.stockDeducted ? 'Stock has been returned.' : undefined)
  }

  return (
    <>
      <PageHeader
        back={{ to: '/admin/orders', label: 'Orders' }}
        title={`Order ${o.ref}`}
        sub={`Placed ${formatDateTime(o.createdAt)} · ${o.source === 'website' ? 'Website' : o.source === 'whatsapp' ? 'From WhatsApp message' : 'Added manually'}`}
        actions={<OrderStatusBadge status={o.status} className="text-sm" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Status" description={o.stockDeducted ? 'Stock for these items has been deducted.' : 'Stock is deducted when the order is confirmed.'} />
            <div className="space-y-5 p-5 sm:p-6">
              <OrderProgress status={o.status} />
              {ACTIONS[o.status].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ACTIONS[o.status].map((a) => (
                    <Button
                      key={a.to}
                      variant={a.tone === 'danger' ? 'secondary' : a.tone}
                      className={a.tone === 'danger' ? 'h-11 text-red-700 hover:!bg-red-50' : a.tone === 'primary' ? 'h-11 !bg-ink hover:!bg-ink-3' : 'h-11'}
                      icon={<a.Icon className="h-4 w-4" />}
                      onClick={() => (a.to === 'cancelled' ? setConfirm({ to: a.to, label: a.label }) : change(a.to))}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-700">This order is complete.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={`Items (${o.items.reduce((s, i) => s + i.quantity, 0)})`} />
            <ul className="divide-y divide-black/[0.06]">
              {o.items.map((i, k) => (
                <li key={k} className="flex items-center gap-4 p-4">
                  {i.image ? <img src={i.image} alt="" className="h-16 w-13 shrink-0 rounded-lg object-cover" /> : <span className="h-16 w-13 shrink-0 rounded-lg bg-black/5" />}
                  <div className="min-w-0 flex-1">
                    {i.slug ? <Link to={`/product/${i.slug}`} target="_blank" className="font-medium hover:underline">{i.name}</Link> : <p className="font-medium">{i.name}</p>}
                    <p className="text-sm text-neutral-600">Size {i.size} · {i.color} · {i.quantity} × {formatBDT(i.unitPrice)}</p>
                    {!i.productId && <p className="text-xs text-amber-700">Not linked to a product — stock is not tracked for this item.</p>}
                  </div>
                  <p className="font-semibold tabular-nums">{formatBDT(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-black/[0.06] p-4 text-sm sm:px-6">
              <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd className="tabular-nums">{formatBDT(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-600">Delivery ({o.customer.area === 'inside' ? 'inside Dhaka' : 'outside Dhaka'})</dt><dd className="tabular-nums">{o.delivery === 0 ? 'Free' : formatBDT(o.delivery)}</dd></div>
              <div className="flex justify-between pt-1 text-base font-bold"><dt>Total (cash on delivery)</dt><dd className="tabular-nums">{formatBDT(o.total)}</dd></div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="History" />
            <ol className="space-y-3 p-5 sm:p-6">
              {[...o.history].reverse().map((h, k) => (
                <li key={k} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink" aria-hidden />
                  <span>
                    <span className="font-medium">{STATUS_LABEL[h.status]}</span> <span className="text-neutral-600">· {formatDateTime(h.at)}</span>
                    {h.note && <span className="block text-neutral-600">{h.note}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <div className="space-y-3 p-5 text-sm">
              <p className="flex gap-3"><User className="h-4 w-4 shrink-0 text-neutral-500" />{o.customer.name || '—'}</p>
              <p className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-neutral-500" /><a href={`tel:${o.customer.phone}`} className="hover:underline">{o.customer.phone || '—'}</a></p>
              <p className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-neutral-500" />{o.customer.address || '—'}</p>
              {o.notes && <p className="flex gap-3"><StickyNote className="h-4 w-4 shrink-0 text-neutral-500" />{o.notes}</p>}
              {phoneDigits && (
                <a
                  href={buildWhatsAppUrl(customerMessage(o), waNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-white hover:brightness-95"
                >
                  <WhatsappIcon className="h-4 w-4" /> Message customer
                </a>
              )}
              <p className="text-xs text-neutral-500">Opens WhatsApp with a ready message for the current status.</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Private note" />
            <div className="space-y-3 p-5">
              <label htmlFor="admin-note" className="sr-only">Private note</label>
              <textarea id="admin-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Courier tracking number, payment received, call notes…" className="w-full rounded-lg border border-black/12 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none" />
              <Button className="h-11" icon={<Save className="h-4 w-4" />} disabled={note === o.adminNote} onClick={() => { updateOrder(o.id, { adminNote: note }); notify('success', 'Note saved') }}>Save note</Button>
            </div>
          </Card>

          <Button variant="ghost" className="h-11 w-full text-red-600 hover:!bg-red-50" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>Delete order</Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.label}?`}
        body={<>Order <strong>{o.ref}</strong> will be marked as cancelled.{o.stockDeducted ? ' Its items go back into stock.' : ''} You can reopen it later.</>}
        confirmLabel="Cancel order"
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) change(confirm.to)
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this order?"
        body={<>Order <strong>{o.ref}</strong> will be permanently removed.{o.stockDeducted ? ' Its items go back into stock.' : ''} This cannot be undone — cancelling keeps a record instead.</>}
        confirmLabel="Delete order"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteOrder(o.id)
          setConfirmDelete(false)
          notify('success', 'Order deleted', o.ref)
          navigate('/admin/orders')
        }}
      />
    </>
  )
}
