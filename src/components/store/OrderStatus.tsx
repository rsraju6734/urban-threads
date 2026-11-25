import { Check, X } from 'lucide-react'
import type { OrderStatus } from '../../types/store'
import { STATUS_LABEL } from '../../context/OrdersContext'
import { cn } from '../../utils/format'

const tone: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  confirmed: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  shipped: 'bg-slate-200 text-slate-800 ring-slate-600/20',
  delivered: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  cancelled: 'bg-red-100 text-red-800 ring-red-600/20',
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', tone[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered']

/** Horizontal progress: Pending → Confirmed → Shipped → Delivered (or Cancelled). */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-red-700">
        <X className="h-4 w-4" /> This order was cancelled.
      </p>
    )
  }
  const reached = FLOW.indexOf(status)
  return (
    <ol className="flex items-center" aria-label={`Order status: ${STATUS_LABEL[status]}`}>
      {FLOW.map((s, i) => {
        const done = i <= reached
        return (
          <li key={s} className={cn('flex items-center', i < FLOW.length - 1 && 'flex-1')}>
            <span className="flex flex-col items-center gap-1.5">
              <span className={cn('grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold', done ? 'bg-ink text-white' : 'bg-neutral-200 text-neutral-500')} aria-current={i === reached ? 'step' : undefined}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn('text-[11px] font-medium', done ? 'text-ink' : 'text-neutral-500')}>{STATUS_LABEL[s]}</span>
            </span>
            {i < FLOW.length - 1 && <span className={cn('mx-1.5 mb-5 h-0.5 flex-1 rounded-full', i < reached ? 'bg-ink' : 'bg-neutral-200')} />}
          </li>
        )
      })}
    </ol>
  )
}
