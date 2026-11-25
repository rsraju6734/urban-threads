import { ClipboardList, MessageSquarePlus, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OrderStatusBadge } from '../../components/store/OrderStatus'
import { Card, EmptyState } from '../../components/studio/ui'
import { ORDER_STATUSES, STATUS_LABEL, useOrders } from '../../context/OrdersContext'
import type { OrderStatus } from '../../types/store'
import { cn, formatBDT, formatDateTime } from '../../utils/format'
import { FilterTabs, PageHeader, inputCls } from './shared'

type Tab = 'all' | OrderStatus
const SOURCE_LABEL = { website: 'Website', whatsapp: 'WhatsApp', manual: 'Manual' } as const

export default function AdminOrders() {
  const { orders } = useOrders()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('status') as Tab) ?? 'all'
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return orders
      .filter((o) => tab === 'all' || o.status === tab)
      .filter((o) => !s || `${o.ref} ${o.customer.name} ${o.customer.phone} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(s))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [orders, tab, q])

  return (
    <>
      <PageHeader
        title="Orders"
        sub="Every order moves Pending → Confirmed → Shipped → Delivered (or Cancelled)."
        actions={
          <>
            <Link to="/admin/orders/new?paste=1" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium hover:bg-neutral-50">
              <MessageSquarePlus className="h-4 w-4" /> Paste WhatsApp Order
            </Link>
            <Link to="/admin/orders/new" className="press inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white hover:bg-ink-3">
              <Plus className="h-4 w-4" /> Add Order
            </Link>
          </>
        }
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          label="Filter orders by status"
          value={tab}
          onChange={(v) => setParams(v === 'all' ? {} : { status: v }, { replace: true })}
          options={[{ value: 'all' as Tab, label: 'All', count: orders.length }, ...ORDER_STATUSES.map((s) => ({ value: s as Tab, label: STATUS_LABEL[s], count: orders.filter((o) => o.status === s).length }))]}
        />
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <label htmlFor="order-search" className="sr-only">Search orders</label>
          <input id="order-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order ref, customer name, phone or product" className={cn(inputCls, 'pl-9')} />
        </div>
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title={orders.length ? 'No orders match' : 'No orders yet'}
            text={
              orders.length
                ? 'Try another status or search.'
                : 'Orders placed on the website from this browser appear here automatically. For orders that arrive on WhatsApp, paste the message to record them.'
            }
            action={orders.length ? undefined : <Link to="/admin/orders/new?paste=1" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white">Paste WhatsApp Order</Link>}
          />
        ) : (
          <ul className="divide-y divide-black/[0.06]" aria-label="Orders">
            {list.map((o) => (
              <li key={o.id}>
                <Link to={`/admin/orders/${o.id}`} className="grid gap-2 p-4 transition-colors hover:bg-black/[0.02] sm:grid-cols-[1.2fr_1.4fr_auto_auto] sm:items-center sm:gap-6">
                  <span>
                    <span className="block font-semibold">{o.ref}</span>
                    <span className="block text-xs text-neutral-600">{formatDateTime(o.createdAt)} · {SOURCE_LABEL[o.source]}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{o.customer.name || 'Unknown customer'}</span>
                    <span className="block truncate text-xs text-neutral-600">{o.customer.phone} · {o.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatBDT(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
