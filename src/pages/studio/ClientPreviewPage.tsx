import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, ClipboardCopy, Copy, Download, FileJson, FileText, Globe, Mail, MapPin, Package, Pencil, Phone, Server, Trash2, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '../../components/ui/BrandIcons'
import { ConfirmDialog, ImportJsonButton, useProfileExport } from '../../components/studio/actions'
import { Badge, Button, Card, CardHeader } from '../../components/studio/ui'
import { useStudio } from '../../context/StudioContext'
import { useToast } from '../../context/ToastContext'
import type { ClientProfile } from '../../types/studio'
import { FEATURE_KEYS } from '../../types/studio'
import { cn, formatBDT, formatDateTime } from '../../utils/format'
import { FEATURE_META } from '../../utils/studio/defaults'
import { generateClaudePrompt } from '../../utils/studio/prompt'
import { completionPercent, digits, splitList, toNumber, validateProfile } from '../../utils/studio/validation'
import StudioNotFound from './StudioNotFound'

export default function ClientPreviewPage() {
  const { id = '' } = useParams()
  const { getProfile } = useStudio()
  const p = getProfile(id)
  if (!p) return <StudioNotFound title="Client profile not found" text="It may have been deleted, or it was saved in a different browser. Import its JSON file to restore it." />
  return <Preview p={p} />
}

function Preview({ p }: { p: ClientProfile }) {
  const navigate = useNavigate()
  const { deleteProfile, duplicateProfile } = useStudio()
  const { notify } = useToast()
  const { exportJson, downloadPrompt, copyPrompt } = useProfileExport()
  const [showPrompt, setShowPrompt] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const issues = useMemo(() => validateProfile(p), [p])
  const errors = issues.filter((i) => i.level === 'error')
  const warnings = issues.filter((i) => i.level === 'warning')
  const prompt = useMemo(() => (showPrompt ? generateClaudePrompt(p) : ''), [p, showPrompt])
  const pct = completionPercent(p)
  const b = p.brand
  const d = p.design
  const o = p.order
  const orderWa = digits(o.whatsappOrderNumber) || digits(b.whatsapp)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/studio/clients" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Client projects
        </Link>
      </div>

      {/* Brand hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden">
          <div className="relative p-6 sm:p-8" style={{ background: d.backgroundColor }}>
            <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: d.secondaryColor }} />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10">
                {b.logoUrl ? <img src={b.logoUrl} alt={`${b.brandName} logo`} className="max-h-16 max-w-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <span className="text-xl font-black" style={{ color: d.primaryColor }}>{(b.brandName || '?').slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: d.primaryColor }}>{b.brandName || 'Untitled client'}</h1>
                  <Badge tone={p.status === 'complete' ? 'success' : 'warning'}>{p.status === 'complete' ? 'Complete' : 'Draft'}</Badge>
                </div>
                {b.tagline && <p className="mt-1 text-sm" style={{ color: d.primaryColor, opacity: 0.75 }}>{b.tagline}</p>}
                <p className="mt-2 text-xs" style={{ color: d.primaryColor, opacity: 0.55 }}>Created {formatDateTime(p.createdAt)} · Updated {formatDateTime(p.updatedAt)}</p>
              </div>
              <div className="w-full sm:w-40">
                <div className="flex justify-between text-xs" style={{ color: d.primaryColor }}><span className="opacity-70">Profile</span><span className="font-semibold">{pct}%</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10">
                  <motion.div className="h-full rounded-full" style={{ background: d.primaryColor }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
            </div>
          </div>

          {/* Export actions */}
          <div className="flex flex-wrap gap-2 border-t border-black/[0.06] p-4 sm:p-5 dark:border-white/[0.06]">
            <Button variant="primary" icon={<FileJson className="h-4 w-4" />} onClick={() => exportJson(p)}>Export Client JSON</Button>
            <Button variant="success" icon={<FileText className="h-4 w-4" />} onClick={() => downloadPrompt(p)}>Download Claude Prompt</Button>
            <Button variant="secondary" icon={<ClipboardCopy className="h-4 w-4" />} onClick={() => copyPrompt(p)}>Copy Claude Prompt</Button>
            <ImportJsonButton />
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/studio/edit/${p.id}`)}>Edit Client Information</Button>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" icon={<Copy className="h-4 w-4" />} onClick={() => { const c = duplicateProfile(p.id); if (c) { notify('success', 'Profile duplicated'); navigate(`/studio/client/${c.id}`) } }}>Duplicate</Button>
              <Button variant="ghost" className="hover:!bg-red-500/10 hover:!text-red-600" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>Delete</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Readiness checklist */}
      <Card>
        <CardHeader
          title={errors.length ? `${errors.length} required item${errors.length === 1 ? '' : 's'} missing` : 'Ready to export'}
          description={errors.length ? 'You can still export, but the prompt will tell Claude these items are missing. Fix them for the best result.' : warnings.length ? `${warnings.length} optional item${warnings.length === 1 ? '' : 's'} could improve the brief.` : 'All information has been provided.'}
          icon={errors.length ? <AlertTriangle className="h-[18px] w-[18px]" /> : <CheckCircle2 className="h-[18px] w-[18px]" />}
          action={errors.length || warnings.length ? <Button size="sm" variant="secondary" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => navigate(`/studio/edit/${p.id}`)}>Fix in editor</Button> : undefined}
        />
        {(errors.length > 0 || warnings.length > 0) && (
          <ul className="grid gap-x-6 gap-y-2 p-5 text-sm sm:grid-cols-2 sm:p-6">
            {errors.map((i, k) => <li key={`e${k}`} className="flex gap-2 text-red-600 dark:text-red-400"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{i.message}</li>)}
            {warnings.map((i, k) => <li key={`w${k}`} className="flex gap-2 text-amber-700 dark:text-amber-300/90"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{i.message}</li>)}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Brand identity" />
          <div className="space-y-4 p-5 text-sm sm:p-6">
            <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{b.description || <Missing>No business description</Missing>}</p>
            <ul className="space-y-2.5">
              <Row icon={<Mail className="h-4 w-4" />} label="Email" value={b.email} />
              <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={b.phone} />
              <Row icon={<WhatsappIcon className="h-4 w-4" />} label="WhatsApp" value={digits(b.whatsapp) ? `+${digits(b.whatsapp)}` : ''} />
              <Row icon={<MapPin className="h-4 w-4" />} label="Address" value={b.address} />
              <Row icon={<FacebookIcon className="h-4 w-4" />} label="Facebook" value={b.facebook} link />
              <Row icon={<InstagramIcon className="h-4 w-4" />} label="Instagram" value={b.instagram} link />
              <Row icon={<TiktokIcon className="h-4 w-4" />} label="TikTok" value={b.tiktok} link />
              {splitList(b.otherSocial).map((s) => <Row key={s} icon={<Globe className="h-4 w-4" />} label="Other" value={s} link={/^https?:/.test(s)} />)}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="Design selections" />
          <div className="space-y-5 p-5 text-sm sm:p-6">
            <div className="grid grid-cols-3 gap-3">
              {[['Primary', d.primaryColor], ['Secondary', d.secondaryColor], ['Background', d.backgroundColor]].map(([l, c]) => (
                <div key={l}>
                  <div className="h-16 rounded-xl ring-1 ring-black/10 dark:ring-white/10" style={{ background: c }} />
                  <p className="mt-1.5 text-xs font-medium">{l}</p>
                  <p className="font-mono text-[11px] text-neutral-500 uppercase">{c}</p>
                </div>
              ))}
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-2.5">
              <dt className="text-neutral-500">Style</dt><dd>{d.styles.length ? <span className="flex flex-wrap gap-1">{d.styles.map((s) => <Badge key={s} tone="info">{s}</Badge>)}</span> : <Missing>Not selected</Missing>}</dd>
              <dt className="text-neutral-500">Typography</dt><dd>{d.typography}</dd>
              <dt className="text-neutral-500">Theme</dt><dd>{d.theme}</dd>
              <dt className="text-neutral-500">References</dt>
              <dd className="min-w-0">{splitList(d.referenceUrls).length ? splitList(d.referenceUrls).map((u) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block truncate text-teal-700 hover:underline dark:text-teal-400">{u}</a>) : <Missing>None</Missing>}</dd>
              {d.referenceNotes && <><dt className="text-neutral-500">Notes</dt><dd className="whitespace-pre-line">{d.referenceNotes}</dd></>}
            </dl>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title={`Products (${p.products.length})`} description="As they will be supplied to Claude" icon={<Package className="h-[18px] w-[18px]" />} />
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {p.products.map((x, i) => {
            const reg = toNumber(x.regularPrice)
            const disc = toNumber(x.discountPrice)
            const imgs = x.imageUrls.filter((u) => u.trim())
            return (
              <motion.div key={x.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }} className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                <div className="relative aspect-[4/5] bg-black/5 dark:bg-white/5">
                  {imgs[0] ? <img src={imgs[0]} alt={x.name} className="h-full w-full object-cover" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /> : <span className="absolute inset-0 grid place-items-center text-xs text-red-500">No image</span>}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {x.newArrival && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                    {disc !== null && reg !== null && disc < reg && <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">SALE</span>}
                    {x.featured && <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">FEATURED</span>}
                  </div>
                  {imgs.length > 1 && <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">{imgs.length} images</span>}
                </div>
                <div className="space-y-1.5 p-3 text-xs">
                  <p className="text-[11px] tracking-wide text-neutral-500 uppercase">{x.category || '—'}</p>
                  <p className="text-sm font-semibold">{x.name || <Missing>Unnamed product</Missing>}</p>
                  <p className="text-sm">
                    {disc !== null ? <><span className="font-semibold text-red-600">{formatBDT(disc)}</span> <span className="text-neutral-400 line-through">{reg !== null ? formatBDT(reg) : ''}</span></> : reg !== null ? <span className="font-semibold">{formatBDT(reg)}</span> : <Missing>No price</Missing>}
                  </p>
                  <p className="text-neutral-500">Sizes: {splitList(x.sizes).join(', ') || '—'}</p>
                  <p className="text-neutral-500">Colors: {splitList(x.colors).join(', ') || '—'}</p>
                  <p className="text-neutral-500">Stock: {x.stock || '—'}{x.sku && ` · SKU ${x.sku}`}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Requested features" icon={<Server className="h-[18px] w-[18px]" />} />
          <div className="p-5 sm:p-6">
            <ul className="flex flex-wrap gap-2">
              {FEATURE_KEYS.filter((k) => p.features[k]).map((k) => (
                <li key={k} className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-medium', FEATURE_META[k].level === 'backend' ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200' : FEATURE_META[k].level === 'partial' ? 'border-teal-500/30 bg-teal-500/10' : 'border-black/10 dark:border-white/10')}>
                  {FEATURE_META[k].label}
                </li>
              ))}
            </ul>
            {FEATURE_KEYS.some((k) => p.features[k] && FEATURE_META[k].level !== 'static') && (
              <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                <p className="font-semibold">Needs backend / extra services:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {FEATURE_KEYS.filter((k) => p.features[k] && FEATURE_META[k].level !== 'static').map((k) => <li key={k}>{FEATURE_META[k].label} — {FEATURE_META[k].note}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Order & delivery" icon={<Truck className="h-[18px] w-[18px]" />} />
          <dl className="grid grid-cols-[150px_1fr] gap-y-2.5 p-5 text-sm sm:p-6">
            <dt className="text-neutral-500">WhatsApp orders</dt><dd>{orderWa ? `+${orderWa}` : <Missing>Not provided</Missing>}</dd>
            <dt className="text-neutral-500">Inside Dhaka</dt><dd>{toNumber(o.deliveryInsideDhaka) !== null ? formatBDT(toNumber(o.deliveryInsideDhaka)!) : <Missing>Not provided</Missing>}</dd>
            <dt className="text-neutral-500">Outside Dhaka</dt><dd>{toNumber(o.deliveryOutsideDhaka) !== null ? formatBDT(toNumber(o.deliveryOutsideDhaka)!) : <Missing>Not provided</Missing>}</dd>
            <dt className="text-neutral-500">Free delivery over</dt><dd>{toNumber(o.freeDeliveryThreshold) !== null ? formatBDT(toNumber(o.freeDeliveryThreshold)!) : '—'}</dd>
            <dt className="text-neutral-500">Delivery time</dt><dd>{o.estimatedDelivery || '—'}</dd>
            <dt className="text-neutral-500">Payment</dt><dd>{[...o.paymentMethods].join(', ') || '—'}</dd>
            <dt className="text-neutral-500">Cash on Delivery</dt><dd>{o.cashOnDelivery ? 'Available' : 'Not available'}</dd>
            <dt className="text-neutral-500">Return policy</dt><dd className="whitespace-pre-line">{o.returnPolicy || '—'}</dd>
            <dt className="text-neutral-500">Exchange policy</dt><dd className="whitespace-pre-line">{o.exchangePolicy || '—'}</dd>
          </dl>
        </Card>
      </div>

      {Object.values(p.additional).some((v) => v.trim()) && (
        <Card>
          <CardHeader title="Additional instructions" />
          <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2 sm:p-6">
            {([
              ['Special design requirements', p.additional.designRequirements],
              ['Special features', p.additional.specialFeatures],
              ['Important notes', p.additional.importantNotes],
              ['Reference materials', p.additional.referenceMaterials],
              ['Hosting preference', p.additional.hostingPreference],
              ['Domain information', p.additional.domainInfo],
            ] as const).filter(([, v]) => v.trim()).map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-neutral-500">{l}</dt><dd className="mt-1 whitespace-pre-line">{v}</dd></div>
            ))}
          </dl>
        </Card>
      )}

      <Card>
        <button onClick={() => setShowPrompt((v) => !v)} aria-expanded={showPrompt} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6">
          <span>
            <span className="block font-semibold">Generated Claude development prompt</span>
            <span className="block text-sm text-neutral-500">Preview exactly what will be copied or downloaded</span>
          </span>
          <ChevronDown className={cn('h-5 w-5 transition-transform', showPrompt && 'rotate-180')} />
        </button>
        <AnimatePresence initial={false}>
          {showPrompt && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="border-t border-black/[0.06] p-5 sm:p-6 dark:border-white/[0.06]">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" icon={<ClipboardCopy className="h-3.5 w-3.5" />} onClick={() => copyPrompt(p)}>Copy</Button>
                  <Button size="sm" variant="secondary" icon={<Download className="h-3.5 w-3.5" />} onClick={() => downloadPrompt(p)}>Download .txt</Button>
                  <span className="ml-auto self-center text-xs text-neutral-500">{prompt.length.toLocaleString()} characters</span>
                </div>
                <pre className="max-h-[520px] overflow-auto rounded-xl bg-[#0b0b0d] p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-neutral-200">{prompt}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete client profile?"
        body={<>This permanently deletes <strong>{b.brandName || 'this profile'}</strong> from this browser. This cannot be undone — export the JSON first if you might need it.</>}
        confirmLabel="Delete permanently"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteProfile(p.id)
          setConfirmDelete(false)
          notify('success', 'Profile deleted', b.brandName)
          navigate('/studio/clients')
        }}
      />
    </div>
  )
}

function Missing({ children }: { children: React.ReactNode }) {
  return <span className="text-amber-600 italic dark:text-amber-400/90">{children}</span>
}

function Row({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-neutral-400">{icon}</span>
      <span className="w-20 shrink-0 text-neutral-500">{label}</span>
      <span className="min-w-0 flex-1 truncate">
        {!value ? <span className="text-neutral-400">—</span> : link ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline dark:text-teal-400">{value}</a> : value}
      </span>
    </li>
  )
}
