import { Copy, Eye, EyeOff, Minus, Package, Pencil, Plus, PlusCircle, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/studio/actions'
import { Badge, Card, EmptyState } from '../../components/studio/ui'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { categories, categoryName } from '../../data/categories'
import type { Product } from '../../types/store'
import { cn, formatBDT, uid } from '../../utils/format'
import { FilterTabs, PageHeader, inputCls } from './shared'

type Filter = 'all' | 'visible' | 'hidden' | 'low' | 'out'
export const LOW_STOCK = 5

export default function AdminProducts() {
  const { allProducts, saveProduct, deleteProduct } = useCatalog()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [filter, setFilter] = useState<Filter>('all')
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const counts = {
    all: allProducts.length,
    visible: allProducts.filter((p) => !p.hidden).length,
    hidden: allProducts.filter((p) => p.hidden).length,
    low: allProducts.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length,
    out: allProducts.filter((p) => p.stock <= 0).length,
  }

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return allProducts.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false
      if (filter === 'visible' && p.hidden) return false
      if (filter === 'hidden' && !p.hidden) return false
      if (filter === 'low' && !(p.stock > 0 && p.stock <= LOW_STOCK)) return false
      if (filter === 'out' && p.stock > 0) return false
      return !s || `${p.name} ${p.slug} ${categoryName(p.category)}`.toLowerCase().includes(s)
    })
  }, [allProducts, q, cat, filter])

  const setStock = (p: Product, stock: number) => saveProduct({ ...p, stock: Math.max(0, Math.min(99999, Math.round(stock) || 0)) })
  const toggleHidden = (p: Product) => {
    saveProduct({ ...p, hidden: !p.hidden })
    notify('success', p.hidden ? 'Product is now visible in the shop' : 'Product hidden from the shop', p.name)
  }
  const duplicate = (p: Product) => {
    const base = `${p.slug}-copy`
    let slug = base
    let n = 2
    while (allProducts.some((x) => x.slug === slug)) slug = `${base}-${n++}`
    const copy: Product = { ...structuredClone(p), id: uid('prod'), slug, name: `${p.name} (Copy)`, hidden: true }
    saveProduct(copy)
    notify('success', 'Product duplicated', 'The copy is hidden until you publish it.')
    navigate(`/admin/products/${copy.id}`)
  }

  return (
    <>
      <PageHeader
        title="Products"
        sub={`${counts.all} products · ${counts.visible} visible in the shop`}
        actions={
          <Link to="/admin/products/new" className="press inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white hover:bg-ink-3">
            <PlusCircle className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          label="Filter products"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'visible', label: 'Visible', count: counts.visible },
            { value: 'hidden', label: 'Hidden', count: counts.hidden },
            { value: 'low', label: 'Low stock', count: counts.low },
            { value: 'out', label: 'Sold out', count: counts.out },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <label htmlFor="prod-search" className="sr-only">Search products</label>
            <input id="prod-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className={cn(inputCls, 'pl-9')} />
          </div>
          <label htmlFor="prod-cat" className="sr-only">Category</label>
          <select id="prod-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={cn(inputCls, 'sm:w-56')}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title={allProducts.length ? 'No products match' : 'No products yet'}
            text={allProducts.length ? 'Try another search or filter.' : 'Add your first product to start selling.'}
            action={<Link to="/admin/products/new" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white">Add Product</Link>}
          />
        ) : (
          <ul className="divide-y divide-black/[0.06]" aria-label="Products">
            {list.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <Link to={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  {p.images[0] ? <img src={p.images[0]} alt="" className="h-16 w-13 shrink-0 rounded-lg object-cover" /> : <span className="grid h-16 w-13 shrink-0 place-items-center rounded-lg bg-black/5"><Package className="h-4 w-4 text-neutral-400" /></span>}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">{p.name}</span>
                      {p.hidden && <Badge tone="neutral">Hidden</Badge>}
                      {p.stock <= 0 ? <Badge tone="danger">Sold out</Badge> : p.stock <= LOW_STOCK ? <Badge tone="warning">Low stock</Badge> : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-600">
                      {categoryName(p.category)} ·{' '}
                      {p.salePrice ? <><span className="font-medium text-red-700">{formatBDT(p.salePrice)}</span> <span className="line-through">{formatBDT(p.price)}</span></> : formatBDT(p.price)}
                    </span>
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex h-11 items-center rounded-lg border border-black/12 bg-white" role="group" aria-label={`Stock for ${p.name}`}>
                    <button onClick={() => setStock(p, p.stock - 1)} disabled={p.stock <= 0} className="grid h-full w-10 place-items-center hover:bg-neutral-50 disabled:opacity-30" aria-label={`Decrease stock of ${p.name}`}><Minus className="h-3.5 w-3.5" /></button>
                    <input
                      type="number"
                      min={0}
                      value={p.stock}
                      onChange={(e) => setStock(p, Number(e.target.value))}
                      className="h-full w-14 border-x border-black/10 text-center text-sm tabular-nums focus:outline-none"
                      aria-label={`Stock quantity of ${p.name}`}
                    />
                    <button onClick={() => setStock(p, p.stock + 1)} className="grid h-full w-10 place-items-center hover:bg-neutral-50" aria-label={`Increase stock of ${p.name}`}><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <IconBtn label={p.hidden ? `Show ${p.name} in shop` : `Hide ${p.name} from shop`} onClick={() => toggleHidden(p)}>{p.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconBtn>
                  <IconBtn label={`Edit ${p.name}`} onClick={() => navigate(`/admin/products/${p.id}`)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn label={`Duplicate ${p.name}`} onClick={() => duplicate(p)}><Copy className="h-4 w-4" /></IconBtn>
                  <IconBtn label={`Delete ${p.name}`} danger onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        body={<><strong>{toDelete?.name}</strong> will be removed from the shop and the admin. Past orders keep their item details. This cannot be undone — hide the product instead if you may sell it again.</>}
        confirmLabel="Delete product"
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteProduct(toDelete.id)
            notify('success', 'Product deleted', toDelete.name)
          }
          setToDelete(null)
        }}
      />
    </>
  )
}

export function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={cn('grid h-11 w-11 place-items-center rounded-lg border border-black/10 bg-white transition-colors', danger ? 'hover:border-red-500/40 hover:bg-red-50 hover:text-red-600' : 'hover:bg-neutral-50')}>
      {children}
    </button>
  )
}
