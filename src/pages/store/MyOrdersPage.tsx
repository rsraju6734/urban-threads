import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderProgress, OrderStatusBadge } from '../../components/store/OrderStatus'
import { SplitWords } from '../../components/ui/Reveal'
import { useOrders } from '../../context/OrdersContext'
import { formatBDT, formatDateTime } from '../../utils/format'

/** Orders placed from this browser. Status changes made by the shop in Admin → Orders appear here. */
export default function MyOrdersPage() {
  const { orders, myOrderRefs } = useOrders()
  const mine = orders.filter((o) => myOrderRefs.includes(o.ref))

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        <SplitWords text="My Orders" inView={false} />
      </h1>
      <p className="mt-3 max-w-xl text-neutral-600">Orders you placed from this device and their latest status. We confirm every order on WhatsApp.</p>

      {mine.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-ivory px-6 py-20 text-center">
          <Package className="h-10 w-10 text-stone" />
          <p className="mt-4 text-xl font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-neutral-600">Orders you send on WhatsApp from this device appear here.</p>
          <Link to="/shop" className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white hover:bg-ink-3">Start Shopping</Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-5">
          {mine.map((o) => (
            <li key={o.id} className="rounded-2xl border border-black/10 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">Order {o.ref}</p>
                  <p className="text-sm text-neutral-600">Placed {formatDateTime(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items · {formatBDT(o.total)}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-6 max-w-xl">
                <OrderProgress status={o.status} />
              </div>
              <ul className="mt-6 flex flex-wrap gap-3">
                {o.items.map((i, k) => (
                  <li key={k} className="flex items-center gap-3 rounded-xl bg-ivory p-2 pr-4 text-sm">
                    {i.image ? <img src={i.image} alt="" className="h-14 w-11 rounded-lg object-cover" /> : <span className="h-14 w-11 rounded-lg bg-cream" />}
                    <span>
                      <span className="block font-medium">{i.name}</span>
                      <span className="block text-xs text-neutral-600">{i.size} · {i.color} · ×{i.quantity}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
