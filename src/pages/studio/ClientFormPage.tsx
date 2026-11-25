import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, Check, ChevronDown, CloudCheck, Copy, ImagePlus, ListChecks, NotebookPen, Package, Palette, Plus, Save, Trash2, Truck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/studio/actions'
import { Badge, Button, Card, CardHeader, ChipToggle, ColorField, SelectField, TextAreaField, TextField, Toggle } from '../../components/studio/ui'
import { useStudio } from '../../context/StudioContext'
import { useToast } from '../../context/ToastContext'
import type { AdditionalInfo, BrandDesign, BrandInfo, ClientProduct, ClientProfile, FeatureKey, OrderDelivery } from '../../types/studio'
import { FEATURE_KEYS } from '../../types/studio'
import { cn, formatBDT, formatDateTime, uid } from '../../utils/format'
import { CATEGORY_SUGGESTIONS, DESIGN_STYLES, FEATURE_META, PAYMENT_METHODS, THEMES, TYPOGRAPHY_OPTIONS, emptyProduct, emptyProfile } from '../../utils/studio/defaults'
import { productIssues, toNumber, validateProfile, type SectionId } from '../../utils/studio/validation'
import StudioNotFound from './StudioNotFound'

const SECTIONS: { id: SectionId; title: string; short: string; Icon: typeof Building2; description: string }[] = [
  { id: 'brand', title: 'Brand Information', short: 'Brand', Icon: Building2, description: 'Identity, contact details and social links' },
  { id: 'design', title: 'Brand Design', short: 'Design', Icon: Palette, description: 'Colors, typography, style and references' },
  { id: 'products', title: 'Product Information', short: 'Products', Icon: Package, description: 'Add every product the website should sell' },
  { id: 'features', title: 'Website Requirements', short: 'Features', Icon: ListChecks, description: 'Pages and functionality the client needs' },
  { id: 'order', title: 'Order & Delivery', short: 'Delivery', Icon: Truck, description: 'WhatsApp ordering, delivery charges and policies' },
  { id: 'additional', title: 'Additional Instructions', short: 'Notes', Icon: NotebookPen, description: 'Special requests, hosting and domain' },
]

export default function ClientFormPage() {
  const { id } = useParams()
  const { getProfile } = useStudio()
  const existing = id ? getProfile(id) : undefined
  if (id && !existing) return <StudioNotFound title="Client profile not found" text="It may have been deleted, or it was saved in a different browser." />
  return <ClientForm key={id ?? 'new'} initial={existing ? structuredClone(existing) : emptyProfile()} isNew={!existing} />
}

function ClientForm({ initial, isNew }: { initial: ClientProfile; isNew: boolean }) {
  const { saveProfile } = useStudio()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [p, setP] = useState<ClientProfile>(initial)
  const [section, setSection] = useState<SectionId>('brand')
  const [showErrors, setShowErrors] = useState(!isNew)
  const [savedAt, setSavedAt] = useState<string | null>(isNew ? null : initial.updatedAt)
  const [dirty, setDirty] = useState(false)
  const hasSavedOnce = useRef(!isNew)

  const issues = useMemo(() => validateProfile(p), [p])
  const errors = useMemo(() => {
    const m: Record<string, string> = {}
    issues.filter((i) => i.level === 'error').forEach((i) => (m[i.field] ??= i.message.replace(/^[^:]+: /, '')))
    return m
  }, [issues])
  const err = (field: string) => (showErrors ? errors[field] : undefined)
  const sectionErrors = (s: SectionId) => issues.filter((i) => i.section === s && i.level === 'error').length

  const update = (fn: (draft: ClientProfile) => ClientProfile) => {
    setP(fn)
    setDirty(true)
  }
  const setBrand = <K extends keyof BrandInfo>(k: K, v: BrandInfo[K]) => update((d) => ({ ...d, brand: { ...d.brand, [k]: v } }))
  const setDesign = <K extends keyof BrandDesign>(k: K, v: BrandDesign[K]) => update((d) => ({ ...d, design: { ...d.design, [k]: v } }))
  const setOrder = <K extends keyof OrderDelivery>(k: K, v: OrderDelivery[K]) => update((d) => ({ ...d, order: { ...d.order, [k]: v } }))
  const setAdditional = <K extends keyof AdditionalInfo>(k: K, v: AdditionalInfo[K]) => update((d) => ({ ...d, additional: { ...d.additional, [k]: v } }))
  const setProduct = (pid: string, patch: Partial<ClientProduct>) => update((d) => ({ ...d, products: d.products.map((x) => (x.id === pid ? { ...x, ...patch } : x)) }))

  // Autosave (debounced) once the profile has a brand name
  useEffect(() => {
    if (!dirty || !p.brand.brandName.trim()) return
    const t = setTimeout(() => {
      const saved = saveProfile(p)
      hasSavedOnce.current = true
      setSavedAt(saved.updatedAt)
      setDirty(false)
    }, 900)
    return () => clearTimeout(t)
  }, [p, dirty, saveProfile])

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const saveNow = (goPreview: boolean) => {
    if (!p.brand.brandName.trim()) {
      setShowErrors(true)
      setSection('brand')
      notify('error', 'Brand name required', 'Enter at least the brand name to save this profile.')
      return
    }
    const saved = saveProfile(p)
    hasSavedOnce.current = true
    setSavedAt(saved.updatedAt)
    setDirty(false)
    setShowErrors(true)
    if (goPreview) {
      navigate(`/studio/client/${saved.id}`)
      notify(saved.status === 'complete' ? 'success' : 'info', saved.status === 'complete' ? 'Profile complete & saved' : 'Saved as draft', saved.status === 'complete' ? 'Review the preview, then export.' : 'Some required information is still missing — see the checklist.')
    } else {
      notify('success', 'Profile saved', saved.status === 'complete' ? 'All required information is complete.' : 'Saved as draft.')
    }
  }

  const idx = SECTIONS.findIndex((s) => s.id === section)
  const go = (i: number) => {
    setSection(SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, i))].id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const totalErrors = issues.filter((i) => i.level === 'error').length

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to={isNew ? '/studio' : `/studio/client/${p.id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" /> {isNew ? 'Overview' : 'Back to preview'}
          </Link>
          <h1 className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl">{isNew ? 'Create New Client' : `Edit: ${p.brand.brandName || 'Untitled client'}`}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">
            {dirty ? (
              <>Unsaved changes{!p.brand.brandName.trim() && ' — enter a brand name to enable autosave'}</>
            ) : savedAt ? (
              <><CloudCheck className="h-4 w-4 text-emerald-500" /> Saved {formatDateTime(savedAt)}</>
            ) : (
              'Start with the brand name — your work autosaves to this browser.'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Save className="h-4 w-4" />} onClick={() => saveNow(false)}>Save Draft</Button>
          <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />} onClick={() => saveNow(true)}>Save & Preview</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Section navigation */}
        <nav aria-label="Form sections" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ol className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
            {SECTIONS.map((s, i) => {
              const active = s.id === section
              const n = sectionErrors(s.id)
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    onClick={() => go(i)}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                      active ? 'bg-white shadow-sm ring-1 ring-black/[0.06] dark:bg-white/[0.07] dark:ring-white/[0.08]' : 'text-neutral-500 hover:bg-black/[0.03] dark:text-neutral-400 dark:hover:bg-white/[0.04]',
                    )}
                  >
                    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold', active ? 'bg-teal-700 text-white' : 'bg-black/5 dark:bg-white/10')}>
                      {showErrors && n === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      <span className="lg:hidden">{s.short}</span>
                      <span className="hidden lg:inline">{s.title}</span>
                    </span>
                    {showErrors && n > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{n}</span>}
                  </button>
                </li>
              )
            })}
          </ol>
          {showErrors && (
            <p className={cn('mt-3 hidden rounded-lg px-3 py-2 text-xs lg:block', totalErrors ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300')}>
              {totalErrors ? `${totalErrors} required item${totalErrors === 1 ? '' : 's'} missing — the profile will be saved as a draft.` : 'All required information is complete.'}
            </p>
          )}
        </nav>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <Card>
                <CardHeader
                  title={`${idx + 1}. ${SECTIONS[idx].title}`}
                  description={SECTIONS[idx].description}
                  icon={(() => { const I = SECTIONS[idx].Icon; return <I className="h-[18px] w-[18px]" /> })()}
                />
                <div className="p-5 sm:p-6">
                  {section === 'brand' && <BrandSection p={p} set={setBrand} err={err} />}
                  {section === 'design' && <DesignSection p={p} set={setDesign} err={err} />}
                  {section === 'products' && <ProductsSection p={p} update={update} setProduct={setProduct} showErrors={showErrors} />}
                  {section === 'features' && <FeaturesSection p={p} update={update} err={err} />}
                  {section === 'order' && <OrderSection p={p} set={setOrder} err={err} />}
                  {section === 'additional' && <AdditionalSection p={p} set={setAdditional} />}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => go(idx - 1)} disabled={idx === 0}>Previous</Button>
            {idx < SECTIONS.length - 1 ? (
              <Button variant="secondary" onClick={() => go(idx + 1)}>
                Next: {SECTIONS[idx + 1].short} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={() => saveNow(true)}>Save & Preview <ArrowRight className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type ErrFn = (field: string) => string | undefined
const grid2 = 'grid gap-5 sm:grid-cols-2'

function BrandSection({ p, set, err }: { p: ClientProfile; set: <K extends keyof BrandInfo>(k: K, v: BrandInfo[K]) => void; err: ErrFn }) {
  const b = p.brand
  return (
    <div className="space-y-6">
      <div className={grid2}>
        <TextField label="Brand Name" required value={b.brandName} onChange={(e) => set('brandName', e.target.value)} error={err('brand.brandName')} placeholder="e.g. Deshi Drip" autoFocus />
        <TextField label="Brand Tagline" value={b.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Everyday streetwear, made in Bangladesh" />
      </div>
      <TextAreaField label="Business Description" required rows={4} value={b.description} onChange={(e) => set('description', e.target.value)} error={err('brand.description')} placeholder="What the brand sells, who it is for, what makes it different…" />
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextField label="Brand Logo URL" type="url" value={b.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} error={err('brand.logoUrl')} placeholder="https://…/logo.png" hint="Upload the logo to Google Drive (public), Imgur, Cloudinary or the client's site and paste a direct image link." />
        <LogoPreview url={b.logoUrl} name={b.brandName} color={p.design.primaryColor} />
      </div>
      <div className={grid2}>
        <TextField label="Brand Email" type="email" value={b.email} onChange={(e) => set('email', e.target.value)} error={err('brand.email')} placeholder="hello@brand.com" />
        <TextField label="Business Phone" type="tel" value={b.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" />
        <TextField label="WhatsApp Number" required type="tel" value={b.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} error={err('brand.whatsapp')} placeholder="8801XXXXXXXXX" hint="International format without + or spaces (Bangladesh: 880…)." />
        <TextField label="Business Address" value={b.address} onChange={(e) => set('address', e.target.value)} placeholder="Shop / office address" />
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Social links</p>
        <div className={grid2}>
          <TextField label="Facebook URL" type="url" value={b.facebook} onChange={(e) => set('facebook', e.target.value)} error={err('brand.facebook')} placeholder="https://facebook.com/…" />
          <TextField label="Instagram URL" type="url" value={b.instagram} onChange={(e) => set('instagram', e.target.value)} error={err('brand.instagram')} placeholder="https://instagram.com/…" />
          <TextField label="TikTok URL" type="url" value={b.tiktok} onChange={(e) => set('tiktok', e.target.value)} error={err('brand.tiktok')} placeholder="https://tiktok.com/@…" />
          <TextAreaField label="Other Social Links" rows={2} value={b.otherSocial} onChange={(e) => set('otherSocial', e.target.value)} placeholder="YouTube, Pinterest, Daraz shop… (one per line)" />
        </div>
      </div>
    </div>
  )
}

function LogoPreview({ url, name, color }: { url: string; name: string; color: string }) {
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [url])
  return (
    <div className="mb-[22px] grid h-[72px] w-full place-items-center overflow-hidden rounded-xl border border-dashed border-black/15 bg-white sm:w-36 dark:border-white/15 dark:bg-[#0f0f11]" aria-label="Logo preview">
      {url && !broken ? (
        <img src={url} alt={`${name} logo preview`} className="max-h-14 max-w-[120px] object-contain" onError={() => setBroken(true)} />
      ) : (
        <span className="px-2 text-center text-xs text-neutral-400">{url && broken ? 'Image could not load' : <span className="text-sm font-black tracking-tight" style={{ color }}>{name || 'Logo'}</span>}</span>
      )}
    </div>
  )
}

function DesignSection({ p, set, err }: { p: ClientProfile; set: <K extends keyof BrandDesign>(k: K, v: BrandDesign[K]) => void; err: ErrFn }) {
  const d = p.design
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <ColorField label="Primary Color" value={d.primaryColor} onChange={(v) => set('primaryColor', v)} error={err('design.primaryColor')} />
        <ColorField label="Secondary Color" value={d.secondaryColor} onChange={(v) => set('secondaryColor', v)} error={err('design.secondaryColor')} />
        <ColorField label="Background Color" value={d.backgroundColor} onChange={(v) => set('backgroundColor', v)} error={err('design.backgroundColor')} />
      </div>
      <div className="overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10" aria-label="Color preview">
        <div className="flex items-center justify-between gap-4 p-5" style={{ background: d.backgroundColor }}>
          <div>
            <p className="text-lg font-bold" style={{ color: d.primaryColor }}>{p.brand.brandName || 'Brand Name'}</p>
            <p className="text-xs" style={{ color: d.primaryColor, opacity: 0.7 }}>{p.brand.tagline || 'Live preview of the selected palette'}</p>
          </div>
          <span className="rounded-md px-4 py-2 text-xs font-semibold" style={{ background: d.primaryColor, color: d.backgroundColor }}>Shop Now</span>
        </div>
        <div className="h-2" style={{ background: d.secondaryColor }} />
      </div>
      <div className={grid2}>
        <SelectField label="Preferred Typography" value={d.typography} onChange={(e) => set('typography', e.target.value)} options={TYPOGRAPHY_OPTIONS} />
        <SelectField label="Preferred Website Theme" value={d.theme} onChange={(e) => set('theme', e.target.value as BrandDesign['theme'])} options={THEMES} />
      </div>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Design Style <span className="font-normal text-neutral-500">(select all that apply)</span></legend>
        <div className="flex flex-wrap gap-2">
          {DESIGN_STYLES.map((s) => (
            <ChipToggle key={s} active={d.styles.includes(s)} onClick={() => set('styles', d.styles.includes(s) ? d.styles.filter((x) => x !== s) : [...d.styles, s])}>{s}</ChipToggle>
          ))}
        </div>
      </fieldset>
      <TextAreaField label="Reference Website URLs" rows={3} value={d.referenceUrls} onChange={(e) => set('referenceUrls', e.target.value)} error={err('design.referenceUrls')} placeholder={'https://example-fashion-site.com\nhttps://another-reference.com'} hint="One URL per line. Used for inspiration only." />
      <TextAreaField label="Reference Design Notes" rows={3} value={d.referenceNotes} onChange={(e) => set('referenceNotes', e.target.value)} placeholder="What the client likes about the references, mood, photography style…" />
    </div>
  )
}

const SIZE_PRESETS = [
  { label: 'S–XXL', value: 'S, M, L, XL, XXL' },
  { label: 'Waist 28–36', value: '28, 30, 32, 34, 36' },
  { label: 'Free Size', value: 'Free Size' },
]

function ProductsSection({ p, update, setProduct, showErrors }: { p: ClientProfile; update: (fn: (d: ClientProfile) => ClientProfile) => void; setProduct: (id: string, patch: Partial<ClientProduct>) => void; showErrors: boolean }) {
  const [openId, setOpenId] = useState<string | null>(p.products[0]?.id ?? null)
  const [toRemove, setToRemove] = useState<ClientProduct | null>(null)
  const bottom = useRef<HTMLDivElement>(null)

  const add = () => {
    const np = emptyProduct()
    update((d) => ({ ...d, products: [...d.products, np] }))
    setOpenId(np.id)
    setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 120)
  }
  const duplicate = (x: ClientProduct) => {
    const copy = { ...x, id: uid('prod'), name: x.name ? `${x.name} (Copy)` : '', imageUrls: [...x.imageUrls] }
    update((d) => {
      const i = d.products.findIndex((y) => y.id === x.id)
      const next = [...d.products]
      next.splice(i + 1, 0, copy)
      return { ...d, products: next }
    })
    setOpenId(copy.id)
  }
  const remove = (pid: string) => update((d) => ({ ...d, products: d.products.filter((x) => x.id !== pid) }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          <strong className="text-neutral-900 dark:text-white">{p.products.length}</strong> product{p.products.length === 1 ? '' : 's'} · add as many as the client needs.
        </p>
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={add}>Add Product</Button>
      </div>

      {p.products.length === 0 && (
        <div className="rounded-xl border border-dashed border-black/15 p-10 text-center text-sm text-neutral-500 dark:border-white/15">
          No products yet. <button onClick={add} className="font-medium text-teal-700 hover:underline dark:text-teal-400">Add the first product</button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {p.products.map((x, i) => {
          const open = openId === x.id
          const iss = productIssues(x, i).filter((y) => y.level === 'error')
          const e = (k: string) => (showErrors ? iss.find((y) => y.field.endsWith(`.${k}`))?.message.replace(/^[^:]+: /, '') : undefined)
          const thumb = x.imageUrls.find((u) => u.trim())
          return (
            <motion.div key={x.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3 bg-black/[0.02] px-3 py-3 sm:px-4 dark:bg-white/[0.02]">
                <button onClick={() => setOpenId(open ? null : x.id)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                    {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" onError={(ev) => (ev.currentTarget.style.visibility = 'hidden')} /> : <Package className="h-4 w-4 text-neutral-400" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{x.name || `Product ${i + 1}`}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {[x.category, toNumber(x.regularPrice) !== null && formatBDT(toNumber(x.discountPrice) ?? (toNumber(x.regularPrice) as number)), x.featured && 'Featured', x.newArrival && 'New'].filter(Boolean).join(' · ') || 'Not filled in yet'}
                    </span>
                  </span>
                  {showErrors && iss.length > 0 && <Badge tone="danger">{iss.length} issue{iss.length === 1 ? '' : 's'}</Badge>}
                  <ChevronDown className={cn('ml-auto h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
                </button>
                <button onClick={() => duplicate(x)} className="rounded-lg p-2 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10" title="Duplicate product" aria-label={`Duplicate ${x.name || `product ${i + 1}`}`}><Copy className="h-4 w-4" /></button>
                <button
                  onClick={() => (x.name || x.regularPrice || x.imageUrls.some(Boolean) ? setToRemove(x) : remove(x.id))}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-600"
                  title="Remove product"
                  aria-label={`Remove ${x.name || `product ${i + 1}`}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="space-y-5 border-t border-black/10 p-4 sm:p-5 dark:border-white/10">
                      <div className={grid2}>
                        <TextField label="Product Name" required value={x.name} onChange={(ev) => setProduct(x.id, { name: ev.target.value })} error={e('name')} placeholder="e.g. Oversized Cotton Tee" />
                        <TextField label="Product Category" required list="category-suggestions" value={x.category} onChange={(ev) => setProduct(x.id, { category: ev.target.value })} error={e('category')} placeholder="e.g. T-Shirts" />
                      </div>
                      <TextAreaField label="Product Description" rows={3} value={x.description} onChange={(ev) => setProduct(x.id, { description: ev.target.value })} placeholder="Fabric, fit, details, care…" />
                      <div className="grid gap-5 sm:grid-cols-4">
                        <TextField label="Regular Price (৳)" required inputMode="decimal" value={x.regularPrice} onChange={(ev) => setProduct(x.id, { regularPrice: ev.target.value })} error={e('regularPrice')} placeholder="1290" />
                        <TextField label="Discount Price (৳)" inputMode="decimal" value={x.discountPrice} onChange={(ev) => setProduct(x.id, { discountPrice: ev.target.value })} error={e('discountPrice')} placeholder="Optional" />
                        <TextField label="Stock Quantity" inputMode="numeric" value={x.stock} onChange={(ev) => setProduct(x.id, { stock: ev.target.value })} error={e('stock')} placeholder="e.g. 25" />
                        <TextField label="SKU (optional)" value={x.sku} onChange={(ev) => setProduct(x.id, { sku: ev.target.value })} placeholder="DD-TEE-001" />
                      </div>
                      <ImageUrlList urls={x.imageUrls} onChange={(imageUrls) => setProduct(x.id, { imageUrls })} error={e('imageUrls')} />
                      <div className={grid2}>
                        <div>
                          <TextField label="Available Sizes" value={x.sizes} onChange={(ev) => setProduct(x.id, { sizes: ev.target.value })} placeholder="S, M, L, XL" hint="Comma separated." />
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {SIZE_PRESETS.map((s) => (
                              <button key={s.label} type="button" onClick={() => setProduct(x.id, { sizes: s.value })} className="rounded-md bg-black/5 px-2 py-1 text-[11px] font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15">{s.label}</button>
                            ))}
                          </div>
                        </div>
                        <TextField label="Available Colors" value={x.colors} onChange={(ev) => setProduct(x.id, { colors: ev.target.value })} placeholder="Black, White, Navy" hint="Comma separated color names." />
                      </div>
                      <div className="grid gap-4 rounded-xl bg-black/[0.02] p-4 sm:grid-cols-2 dark:bg-white/[0.03]">
                        <Toggle label="Featured Product" description="Highlight on the homepage" checked={x.featured} onChange={(v) => setProduct(x.id, { featured: v })} />
                        <Toggle label="New Arrival" description="Show a NEW badge" checked={x.newArrival} onChange={(v) => setProduct(x.id, { newArrival: v })} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <datalist id="category-suggestions">
        {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
      </datalist>

      <div ref={bottom}>
        <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/12 py-4 text-sm font-medium text-neutral-500 transition hover:border-teal-500 hover:text-teal-700 dark:border-white/12 dark:hover:text-teal-400">
          <Plus className="h-4 w-4" /> Add Another Product
        </button>
      </div>

      <ConfirmDialog
        open={!!toRemove}
        title="Remove this product?"
        body={<>“{toRemove?.name || 'Untitled product'}” and its details will be removed from this client profile.</>}
        confirmLabel="Remove product"
        onClose={() => setToRemove(null)}
        onConfirm={() => {
          if (toRemove) remove(toRemove.id)
          setToRemove(null)
        }}
      />
    </div>
  )
}

function ImageUrlList({ urls, onChange, error }: { urls: string[]; onChange: (u: string[]) => void; error?: string }) {
  const list = urls.length ? urls : ['']
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Product Image URLs <span className="text-red-500">*</span> <span className="font-normal text-neutral-500">— first image is the main image</span></legend>
      <div className="space-y-2">
        {list.map((u, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
              {u.trim() ? <img src={u} alt="" className="h-full w-full object-cover" onError={(ev) => (ev.currentTarget.style.visibility = 'hidden')} /> : <ImagePlus className="h-4 w-4 text-neutral-400" />}
            </span>
            <input
              type="url"
              value={u}
              onChange={(ev) => onChange(list.map((x, j) => (j === i ? ev.target.value : x)))}
              placeholder={`https://… image ${i + 1}`}
              className={cn('h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 focus:outline-none dark:bg-[#0f0f11]', error ? 'border-red-500' : 'border-black/12 dark:border-white/10')}
              aria-label={`Image URL ${i + 1}`}
            />
            <button type="button" onClick={() => onChange(list.length > 1 ? list.filter((_, j) => j !== i) : [''])} className="rounded-lg p-2 text-neutral-400 hover:bg-red-500/10 hover:text-red-600" aria-label={`Remove image ${i + 1}`}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button type="button" onClick={() => onChange([...list, ''])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">
        <Plus className="h-4 w-4" /> Add image URL
      </button>
    </fieldset>
  )
}

function FeaturesSection({ p, update, err }: { p: ClientProfile; update: (fn: (d: ClientProfile) => ClientProfile) => void; err: ErrFn }) {
  const toggle = (k: FeatureKey) => update((d) => ({ ...d, features: { ...d.features, [k]: !d.features[k] } }))
  const groups: { title: string; keys: FeatureKey[] }[] = [
    { title: 'Pages', keys: ['homepage', 'catalog', 'productDetails', 'about', 'contact', 'faq', 'deliveryInfo'] },
    { title: 'Shopping', keys: ['cart', 'whatsappOrdering', 'search', 'categoryFilter', 'sizeSelection', 'colorSelection', 'reviews', 'coupons'] },
    { title: 'Advanced (backend)', keys: ['adminDashboard', 'stockManagement', 'orderManagement', 'database', 'paymentGateway'] },
  ]
  const backendSelected = FEATURE_KEYS.filter((k) => p.features[k] && FEATURE_META[k].level !== 'static')
  return (
    <div className="space-y-6">
      <div role="note" className={cn('flex gap-3 rounded-xl border p-4 text-sm', backendSelected.length ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200' : 'border-black/10 bg-black/[0.02] text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300')}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Advanced backend features may require additional hosting and database services.</p>
          <p className="mt-1 opacity-90">
            Admin dashboards, stock & order management, databases and payment gateways cannot run on a free static host. They need a server or managed backend (e.g. Supabase, Firebase), secure authentication and — for payments — a merchant account. Quote these separately.
          </p>
          {backendSelected.length > 0 && <p className="mt-2 font-medium">Selected: {backendSelected.map((k) => FEATURE_META[k].label).join(', ')}</p>}
        </div>
      </div>
      {err('features') && <p className="text-sm text-red-600">{err('features')}</p>}
      {groups.map((g) => (
        <fieldset key={g.title}>
          <legend className="mb-3 text-sm font-semibold">{g.title}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.keys.map((k) => {
              const m = FEATURE_META[k]
              const on = p.features[k]
              return (
                <label key={k} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition', on ? 'border-teal-500/60 bg-teal-500/[0.06]' : 'border-black/10 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20')}>
                  <input type="checkbox" checked={on} onChange={() => toggle(k)} className="mt-0.5 h-4 w-4 accent-teal-700" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {m.label}
                      {m.level === 'backend' && <Badge tone="warning">Requires backend</Badge>}
                      {m.level === 'partial' && <Badge tone="info">Partial static</Badge>}
                    </span>
                    {m.note && <span className="mt-0.5 block text-xs text-neutral-500">{m.note}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function OrderSection({ p, set, err }: { p: ClientProfile; set: <K extends keyof OrderDelivery>(k: K, v: OrderDelivery[K]) => void; err: ErrFn }) {
  const o = p.order
  return (
    <div className="space-y-6">
      <div className={grid2}>
        <TextField label="WhatsApp Order Number" type="tel" value={o.whatsappOrderNumber} onChange={(e) => set('whatsappOrderNumber', e.target.value)} error={err('order.whatsappOrderNumber')} placeholder={p.brand.whatsapp || '8801XXXXXXXXX'} hint="Leave empty to use the brand WhatsApp number." />
        <TextField label="Estimated Delivery Time" value={o.estimatedDelivery} onChange={(e) => set('estimatedDelivery', e.target.value)} placeholder="Inside Dhaka 1–2 days, outside 3–5 days" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="Delivery Inside Dhaka (৳)" required inputMode="numeric" value={o.deliveryInsideDhaka} onChange={(e) => set('deliveryInsideDhaka', e.target.value)} error={err('order.deliveryInsideDhaka')} placeholder="70" />
        <TextField label="Delivery Outside Dhaka (৳)" required inputMode="numeric" value={o.deliveryOutsideDhaka} onChange={(e) => set('deliveryOutsideDhaka', e.target.value)} error={err('order.deliveryOutsideDhaka')} placeholder="130" />
        <TextField label="Free Delivery Threshold (৳)" inputMode="numeric" value={o.freeDeliveryThreshold} onChange={(e) => set('freeDeliveryThreshold', e.target.value)} error={err('order.freeDeliveryThreshold')} placeholder="Optional, e.g. 2000" />
      </div>
      <div className={grid2}>
        <TextAreaField label="Return Policy" rows={3} value={o.returnPolicy} onChange={(e) => set('returnPolicy', e.target.value)} placeholder="e.g. Returns accepted within 3 days if the product is damaged…" />
        <TextAreaField label="Exchange Policy" rows={3} value={o.exchangePolicy} onChange={(e) => set('exchangePolicy', e.target.value)} placeholder="e.g. Size exchange within 7 days, unworn with tags…" />
      </div>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Payment Methods</legend>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <ChipToggle key={m} active={o.paymentMethods.includes(m)} onClick={() => set('paymentMethods', o.paymentMethods.includes(m) ? o.paymentMethods.filter((x) => x !== m) : [...o.paymentMethods, m])}>{m}</ChipToggle>
          ))}
        </div>
        {err('order.paymentMethods') && <p className="mt-1 text-xs text-red-600">{err('order.paymentMethods')}</p>}
        <p className="mt-2 text-xs text-neutral-500">Card payments require a payment gateway (backend). Mobile banking can be confirmed manually over WhatsApp.</p>
      </fieldset>
      <div className="rounded-xl bg-black/[0.02] p-4 dark:bg-white/[0.03]">
        <Toggle label="Cash on Delivery available" description="Customers can pay when the order arrives" checked={o.cashOnDelivery} onChange={(v) => set('cashOnDelivery', v)} />
      </div>
    </div>
  )
}

function AdditionalSection({ p, set }: { p: ClientProfile; set: <K extends keyof AdditionalInfo>(k: K, v: AdditionalInfo[K]) => void }) {
  const a = p.additional
  return (
    <div className="space-y-5">
      <TextAreaField label="Special Design Requirements" rows={3} value={a.designRequirements} onChange={(e) => set('designRequirements', e.target.value)} placeholder="Hero video, lookbook section, Bangla language toggle…" />
      <TextAreaField label="Special Features" rows={3} value={a.specialFeatures} onChange={(e) => set('specialFeatures', e.target.value)} placeholder="Size chart popup, pre-order products, gift wrapping option…" />
      <TextAreaField label="Important Notes" rows={3} value={a.importantNotes} onChange={(e) => set('importantNotes', e.target.value)} placeholder="Launch date, budget constraints, must-haves…" />
      <TextAreaField label="Client Reference Materials" rows={3} value={a.referenceMaterials} onChange={(e) => set('referenceMaterials', e.target.value)} placeholder="Google Drive folder links, brand guidelines, photoshoot links…" />
      <div className={grid2}>
        <TextField label="Hosting Preference" value={a.hostingPreference} onChange={(e) => set('hostingPreference', e.target.value)} placeholder="GitHub Pages, Netlify, Vercel, cPanel…" />
        <TextField label="Domain Information" value={a.domainInfo} onChange={(e) => set('domainInfo', e.target.value)} placeholder="brand.com.bd — already owned / needs purchase" />
      </div>
      <p className="rounded-lg bg-black/[0.03] p-3 text-xs text-neutral-500 dark:bg-white/[0.04]">
        Privacy: never record client passwords, hosting logins or payment card details in this form. Share credentials through a secure channel instead.
      </p>
    </div>
  )
}
