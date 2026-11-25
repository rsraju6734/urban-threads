import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../../components/store/ProductCard'
import { Drawer } from '../../components/ui/Modal'
import { EASE, SplitWords, staggerParent } from '../../components/ui/Reveal'
import { categories, categoryName } from '../../data/categories'
import { editorial } from '../../data/content'
import { effectivePrice } from '../../data/products'
import { useCatalog } from '../../context/CatalogContext'
import { cn, formatBDT } from '../../utils/format'

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'new', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const STEP = 100
const floorTo = (n: number) => Math.floor(n / STEP) * STEP
const ceilTo = (n: number) => Math.ceil(n / STEP) * STEP
export default function ShopPage() {
  const { products } = useCatalog()
  const prices = products.map(effectivePrice)
  const MIN = prices.length ? floorTo(Math.min(...prices)) : 0
  const MAX = prices.length ? Math.max(ceilTo(Math.max(...prices)), MIN + STEP) : STEP
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = params.get('category') ?? 'all'
  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const saleOnly = params.get('sale') === '1'
  const min = Number(params.get('min') ?? MIN)
  const max = Number(params.get('max') ?? MAX)

  // Build on the URL as it is right now (not the copy captured at render), so quick successive
  // filter changes never bring back an old value.
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    Object.entries(patch).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)))
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    const list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (saleOnly && !p.salePrice) return false
      const price = effectivePrice(p)
      if (price < min || price > max) return false
      if (s && !`${p.name} ${categoryName(p.category)} ${p.description} ${p.colors.map((c) => c.name).join(' ')}`.toLowerCase().includes(s)) return false
      return true
    })
    const sorted = [...list]
    switch (sort) {
      case 'price-asc': sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b)); break
      case 'price-desc': sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a)); break
      case 'new': sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)); break
      default: sorted.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured))
    }
    return sorted
  }, [products, category, q, sort, saleOnly, min, max])

  const activeCount = [category !== 'all', !!q, saleOnly, min > MIN || max < MAX].filter(Boolean).length
  const resetAll = () => setParams(new URLSearchParams(), { replace: true })
  const title = category === 'all' ? (saleOnly ? 'The Sale' : 'All Products') : categoryName(category)

  const filters = (
    <div className="space-y-8">
      <div>
        <label htmlFor="shop-search" className="eyebrow mb-3 block text-neutral-500">Search</label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input id="shop-search" value={q} onChange={(e) => update({ q: e.target.value })} placeholder="Search products" className="h-11 w-full rounded-lg border border-neutral-300 pr-9 pl-9 text-sm focus:border-ink focus:outline-none" />
          {q && (
            <button onClick={() => update({ q: null })} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-ink" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="eyebrow mb-3 text-neutral-500">Category</legend>
        <ul className="space-y-1">
          {[{ id: 'all', name: 'All Products' }, ...categories].map((c) => {
            const n = c.id === 'all' ? products.length : products.filter((p) => p.category === c.id).length
            const active = category === c.id
            return (
              <li key={c.id}>
                <button onClick={() => update({ category: c.id === 'all' ? null : c.id })} aria-pressed={active} className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition', active ? 'bg-ink text-white' : 'hover:bg-ivory')}>
                  <span>{c.name}</span>
                  <span className={cn('text-xs', active ? 'text-white/70' : 'text-neutral-400')}>{n}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-4 text-neutral-500">Price range</legend>
        <div className="relative h-5">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-neutral-200" />
          <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${((min - MIN) / (MAX - MIN)) * 100}%`, right: `${100 - ((max - MIN) / (MAX - MIN)) * 100}%` }} />
          <input type="range" aria-label="Minimum price" className="range-luxe absolute inset-0 w-full" min={MIN} max={MAX} step={STEP} value={min} onChange={(e) => update({ min: String(Math.min(Number(e.target.value), max - STEP)) })} />
          <input type="range" aria-label="Maximum price" className="range-luxe absolute inset-0 w-full" min={MIN} max={MAX} step={STEP} value={max} onChange={(e) => update({ max: String(Math.max(Number(e.target.value), min + STEP)) })} />
        </div>
        <div className="mt-3 flex justify-between text-sm font-medium tabular-nums">
          <span>{formatBDT(min)}</span>
          <span>{formatBDT(max)}</span>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between rounded-lg bg-ivory px-3 py-3 text-sm">
        <span className="font-medium">On sale only</span>
        <input type="checkbox" checked={saleOnly} onChange={(e) => update({ sale: e.target.checked ? '1' : null })} className="h-4 w-4 accent-ink" />
      </label>

      {activeCount > 0 && (
        <button onClick={resetAll} className="w-full rounded-lg border border-neutral-300 py-2.5 text-sm font-medium transition hover:border-ink">
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <motion.img src={editorial.newsletter} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
        <div className="container-x relative py-16 sm:py-20">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            <SplitWords key={title} text={title} inView={false} delay={0.05} />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-3 max-w-lg text-white/80">
            {category === 'all' ? 'Premium essentials, outerwear and tailoring — crafted to define your style.' : categories.find((c) => c.id === category)?.description}
          </motion.p>
        </div>
      </section>

      <div className="container-x py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block" aria-label="Product filters">
            <div className="sticky top-28">{filters}</div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500" aria-live="polite">
                Showing <strong className="text-ink">{results.length}</strong> {results.length === 1 ? 'product' : 'products'}
                {q && <> for “{q}”</>}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setFiltersOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-neutral-300 px-4 text-sm font-medium lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">{activeCount}</span>}
                </button>
                <label htmlFor="sort" className="sr-only">Sort by</label>
                <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })} className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-ink focus:outline-none">
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {category !== 'all' && <Chip label={categoryName(category)} onClear={() => update({ category: null })} />}
                {q && <Chip label={`“${q}”`} onClear={() => update({ q: null })} />}
                {saleOnly && <Chip label="On sale" onClear={() => update({ sale: null })} />}
                {(min > MIN || max < MAX) && <Chip label={`${formatBDT(min)} – ${formatBDT(max)}`} onClear={() => update({ min: null, max: null })} />}
              </div>
            )}

            <AnimatePresence mode="wait">
              {results.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center rounded-2xl bg-ivory px-6 py-20 text-center">
                  <Search className="h-8 w-8 text-stone" />
                  <p className="mt-4 text-lg font-semibold">No products match your filters</p>
                  <p className="mt-1 text-sm text-neutral-500">Try a different search or widen the price range.</p>
                  <button onClick={resetAll} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">Reset filters</button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${category}-${sort}-${saleOnly}`}
                  variants={staggerParent(0.03)}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4"
                >
                  {results.map((p, i) => (
                    <ProductCard key={p.id} product={p} priority={i < 4} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" side="left" widthClass="max-w-sm" footer={<button onClick={() => setFiltersOpen(false)} className="h-12 w-full rounded-lg bg-ink text-sm font-semibold text-white">Show {results.length} products</button>}>
        <div className="p-5">{filters}</div>
      </Drawer>
    </>
  )
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <motion.span layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1.5 rounded-full bg-ivory py-1.5 pr-1.5 pl-3.5 text-xs font-medium">
      {label}
      <button onClick={onClear} className="rounded-full p-0.5 hover:bg-black/10" aria-label={`Remove filter ${label}`}>
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.span>
  )
}
