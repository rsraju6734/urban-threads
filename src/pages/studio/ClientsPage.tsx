import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Download, Eye, FolderKanban, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog, ImportJsonButton, useProfileExport } from '../../components/studio/actions'
import { Badge, Card, EmptyState } from '../../components/studio/ui'
import { useStudio } from '../../context/StudioContext'
import { useToast } from '../../context/ToastContext'
import type { ClientProfile } from '../../types/studio'
import { cn, formatDate } from '../../utils/format'
import { completionPercent } from '../../utils/studio/validation'

type Filter = 'all' | 'complete' | 'draft'

export default function ClientsPage() {
  const { profiles, deleteProfile, duplicateProfile } = useStudio()
  const { exportJson } = useProfileExport()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [toDelete, setToDelete] = useState<ClientProfile | null>(null)

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return [...profiles]
      .filter((p) => filter === 'all' || p.status === filter)
      .filter((p) => !s || [p.brand.brandName, p.brand.tagline, p.brand.email, p.brand.whatsapp, p.design.styles.join(' '), p.products.map((x) => x.name).join(' ')].join(' ').toLowerCase().includes(s))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [profiles, q, filter])

  const counts = { all: profiles.length, complete: profiles.filter((p) => p.status === 'complete').length, draft: profiles.filter((p) => p.status === 'draft').length }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Client Projects</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Search, edit, duplicate, export or delete saved client profiles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportJsonButton />
          <Link to="/studio/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-600"><PlusCircle className="h-4 w-4" /> Create New Client</Link>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <label htmlFor="client-search" className="sr-only">Search client projects</label>
            <input id="client-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, product, phone…" className="h-10 w-full rounded-lg border border-black/12 bg-white pr-3 pl-9 text-sm focus:border-teal-500 focus:outline-none dark:border-white/10 dark:bg-[#0f0f11]" />
          </div>
          <div className="flex gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.05]" role="tablist" aria-label="Filter by status">
            {(['all', 'complete', 'draft'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('relative rounded-md px-3 py-1.5 text-xs font-medium capitalize transition', filter === f ? 'text-neutral-900 dark:text-white' : 'text-neutral-500')}>
                {filter === f && <motion.span layoutId="client-filter" className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-white/10" />}
                <span className="relative">{f} ({counts[f]})</span>
              </button>
            ))}
          </div>
        </div>

        {profiles.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title="No client projects yet"
            text="Start onboarding your first clothing brand. Everything is saved in this browser."
            action={<Link to="/studio/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-600"><PlusCircle className="h-4 w-4" /> Create New Client</Link>}
          />
        ) : list.length === 0 ? (
          <EmptyState icon={<Search className="h-6 w-6" />} title="No matches" text={`No client projects match “${q}”.`} action={<button onClick={() => { setQ(''); setFilter('all') }} className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">Clear search</button>} />
        ) : (
          <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            <AnimatePresence initial={false}>
              {list.map((p) => {
                const pct = completionPercent(p)
                return (
                  <motion.li key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                    <Link to={`/studio/client/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl text-sm font-bold text-white" style={{ background: p.design.primaryColor || '#4f46e5' }}>
                        {p.brand.logoUrl ? <img src={p.brand.logoUrl} alt="" className="h-full w-full bg-white object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> : (p.brand.brandName || '?').slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-semibold">{p.brand.brandName || 'Untitled client'}</span>
                          <Badge tone={p.status === 'complete' ? 'success' : 'warning'}>{p.status === 'complete' ? 'Complete' : 'Draft'}</Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-neutral-500">
                          {p.products.length} product{p.products.length === 1 ? '' : 's'} · {p.design.styles.join(', ') || 'No style'} · {pct}% · Updated {formatDate(p.updatedAt)}
                        </span>
                      </span>
                    </Link>
                    <div className="flex flex-wrap gap-1 sm:justify-end">
                      <IconBtn label="View details" onClick={() => navigate(`/studio/client/${p.id}`)}><Eye className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Edit" onClick={() => navigate(`/studio/edit/${p.id}`)}><Pencil className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Duplicate" onClick={() => { const c = duplicateProfile(p.id); if (c) notify('success', 'Profile duplicated', c.brand.brandName) }}><Copy className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Export JSON" onClick={() => exportJson(p)}><Download className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Delete" danger onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></IconBtn>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete client profile?"
        body={<>This permanently deletes <strong>{toDelete?.brand.brandName || 'this profile'}</strong> from this browser. This cannot be undone — export the JSON first if you might need it.</>}
        confirmLabel="Delete permanently"
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteProfile(toDelete.id)
            notify('success', 'Profile deleted', toDelete.brand.brandName)
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}

function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={cn('grid h-9 w-9 place-items-center rounded-lg border border-black/10 transition dark:border-white/10', danger ? 'hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]')}>
      {children}
    </button>
  )
}
