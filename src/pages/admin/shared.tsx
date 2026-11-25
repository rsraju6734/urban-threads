import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState } from '../../components/studio/ui'
import { cn } from '../../utils/format'

export function PageHeader({ title, sub, actions, back }: { title: string; sub?: string; actions?: ReactNode; back?: { to: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex min-h-11 items-center text-sm text-neutral-600 hover:text-neutral-900">
            ← {back.label}
          </Link>
        )}
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-neutral-600">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function AdminNotFound({ title = 'Not found', text = 'This admin page does not exist.' }: { title?: string; text?: string }) {
  return (
    <Card>
      <EmptyState
        icon={<SearchX className="h-6 w-6" />}
        title={title}
        text={text}
        action={<Link to="/admin" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white hover:bg-ink-3">Back to dashboard</Link>}
      />
    </Card>
  )
}

/** Segmented tabs with counts, used for order status and product filters. */
export function FilterTabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors',
            value === o.value ? 'bg-ink text-white' : 'bg-white text-neutral-700 ring-1 ring-black/10 hover:bg-neutral-50',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className={cn('rounded-full px-1.5 text-[11px] tabular-nums', value === o.value ? 'bg-white/20' : 'bg-black/5')}>{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export const inputCls = 'h-11 w-full rounded-lg border border-black/12 bg-white px-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 focus:outline-none'
