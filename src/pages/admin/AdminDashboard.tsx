import { AlertTriangle, ArrowRight, ClipboardList, Clock, Package, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '../../components/store/OrderStatus'
import { Card, CardHeader, EmptyState } from '../../components/studio/ui'
import { useCatalog } from '../../context/CatalogContext'
import { ORDER_STATUSES, STATUS_LABEL, useOrders } from '../../context/OrdersContext'
import { formatBDT, formatDateTime } from '../../utils/format'
import { LOW_STOCK } from './AdminProducts'
import { PageHeader } from './shared'

export default function AdminDashboard() {
  const { orders } = useOrders()
  const { allProducts } = useCatalog()
  const pending = orders.filter((o) => o.status === 'pending')
  const active = orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped')
  // revenue counts only delivered orders: money actually collected (cash on delivery)
  const revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const lowStock = allProducts.filter((p) => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock)
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)

  const stats = [
    { label: 'Pending orders', value: String(pending.length), Icon: Clock, to: '/admin/orders?status=pending', tone: 'text-amber-600' },
    { label: 'Confirmed & shipped', value: String(active.length), Icon: ClipboardList, to: '/admin/orders?status=confirmed', tone: 'text-sky-600' },
    { label: 'Delivered revenue', value: formatBDT(revenue), Icon: Wallet, to: '/admin/orders?status=delivered', tone: 'text-emerald-600' },
    { label: 'Products in shop', value: String(allProducts.filter((p) => !p.hidden).length), Icon: Package, to: '/admin/products', tone: 'text-neutral-700' },
  ]

  return (
    <>
      <PageHeader title="Dashboard" sub="Today's work at a glance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, to, tone }) => (
          <Link key={label} to={to} className="rounded-2xl border border-black/[0.07] bg-white p-5 transition-[translate] duration-200 hover:-translate-y-0.5">
            <Icon className={`h-5 w-5 ${tone}`} />
            <p className="mt-4 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</p>
            <p className="mt-1 text-xs font-medium text-neutral-600">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <Card>
          <CardHeader title="Recent orders" action={<Link to="/admin/orders" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline">All orders</Link>} />
          {recent.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No orders yet" text="Website orders from this browser appear here. Paste WhatsApp orders to record them." action={<Link to="/admin/orders/new?paste=1" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white">Paste WhatsApp Order</Link>} />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.02]">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{o.ref} · {o.customer.name}</span>
                      <span className="block text-xs text-neutral-600">{formatDateTime(o.createdAt)} · {formatBDT(o.total)}</span>
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {orders.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-black/[0.06] p-4">
              {ORDER_STATUSES.map((s) => (
                <Link key={s} to={`/admin/orders?status=${s}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-black/[0.03] px-3 text-xs font-medium hover:bg-black/[0.06]">
                  {STATUS_LABEL[s]} <span className="tabular-nums text-neutral-600">{orders.filter((o) => o.status === s).length}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Low stock" description={`${LOW_STOCK} or fewer left`} icon={<AlertTriangle className="h-[18px] w-[18px]" />} />
          {lowStock.length === 0 ? (
            <p className="p-5 text-sm text-neutral-600">Every product has more than {LOW_STOCK} in stock.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.02]">
                    <img src={p.images[0]} alt="" className="h-11 w-9 rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className={`text-sm font-semibold tabular-nums ${p.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
