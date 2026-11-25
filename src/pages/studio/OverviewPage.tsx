import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, FolderKanban, PlusCircle, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ImportJsonButton } from '../../components/studio/actions'
import { Badge, Card, CardHeader, EmptyState } from '../../components/studio/ui'
import { useStudio } from '../../context/StudioContext'
import { formatDateTime } from '../../utils/format'
import { completionPercent } from '../../utils/studio/validation'

const ease = [0.22, 1, 0.36, 1] as const

export default function OverviewPage() {
  const { profiles, storageOk } = useStudio()
  const complete = profiles.filter((p) => p.status === 'complete').length
  const drafts = profiles.length - complete
  const recent = [...profiles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const weekAgo = Date.now() - 7 * 86400000
  const thisWeek = profiles.filter((p) => new Date(p.createdAt).getTime() > weekAgo).length

  const stats = [
    { label: 'Total client projects', value: profiles.length, Icon: FolderKanban, tone: 'from-teal-500/15 to-teal-500/0 text-teal-700 dark:text-teal-300' },
    { label: 'Completed profiles', value: complete, Icon: CheckCircle2, tone: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300' },
    { label: 'Draft profiles', value: drafts, Icon: FileText, tone: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300' },
    { label: 'Created this week', value: thisWeek, Icon: Clock3, tone: 'from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Studio Overview</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Collect clothing-brand requirements and turn them into a ready-to-build Claude brief.</p>
        </div>
      </div>

      {!storageOk && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          Your browser blocked local storage (private mode or storage full). Changes will be lost on refresh — export JSON to keep your work.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, tone }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease }}>
            <Card className="relative overflow-hidden p-5">
              <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-60`} aria-hidden />
              <div className="relative">
                <Icon className={`h-5 w-5 ${tone.split(' ').slice(2).join(' ')}`} />
                <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <Card>
          <CardHeader title="Recently updated profiles" description="Your latest client onboarding work" action={<Link to="/studio/clients" className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">View all</Link>} />
          {recent.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title="No client profiles yet"
              text="Create your first client profile or import an existing client JSON file."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/studio/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-600"><PlusCircle className="h-4 w-4" /> Create New Client</Link>
                  <ImportJsonButton />
                </div>
              }
            />
          ) : (
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {recent.map((p) => {
                const pct = completionPercent(p)
                return (
                  <li key={p.id}>
                    <Link to={`/studio/client/${p.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-black/[0.02] sm:px-6 dark:hover:bg-white/[0.02]">
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-sm font-bold text-white" style={{ background: p.design.primaryColor || '#4f46e5' }}>
                        {p.brand.logoUrl ? <img src={p.brand.logoUrl} alt="" className="h-full w-full bg-white object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> : (p.brand.brandName || '?').slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">{p.brand.brandName || 'Untitled client'}</span>
                          <Badge tone={p.status === 'complete' ? 'success' : 'warning'}>{p.status === 'complete' ? 'Complete' : 'Draft'}</Badge>
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500">{p.products.length} product{p.products.length === 1 ? '' : 's'} · Updated {formatDateTime(p.updatedAt)}</span>
                      </span>
                      <span className="hidden w-28 sm:block">
                        <span className="flex justify-between text-[11px] text-neutral-500"><span>Profile</span><span>{pct}%</span></span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                          <span className={`block h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Quick actions" />
            <div className="grid gap-2 p-4">
              <Link to="/studio/new" className="flex items-center gap-3 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-teal-600">
                <PlusCircle className="h-5 w-5" /> Create New Client
              </Link>
              <Link to="/studio/clients" className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5 text-sm font-medium transition hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
                <FolderKanban className="h-5 w-5 text-neutral-500" /> Manage Client Projects
              </Link>
              <div className="[&>button]:h-auto [&>button]:w-full [&>button]:justify-start [&>button]:rounded-xl [&>button]:px-4 [&>button]:py-3.5">
                <ImportJsonButton />
              </div>
              <Link to="/studio/guide" className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5 text-sm font-medium transition hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
                <BookOpen className="h-5 w-5 text-neutral-500" /> How the workflow works
              </Link>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold">Workflow</p>
            <ol className="mt-3 space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              {['Fill in the client onboarding form', 'Review the client preview & fix warnings', 'Export JSON + download the Claude prompt', 'Paste the prompt into Claude & attach the JSON'].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500/15 text-[11px] font-bold text-teal-700 dark:text-teal-300">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
