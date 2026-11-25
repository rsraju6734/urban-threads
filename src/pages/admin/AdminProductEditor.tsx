import { ExternalLink, ImagePlus, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/studio/actions'
import { Button, Card, CardHeader, Field, TextAreaField, TextField, Toggle } from '../../components/studio/ui'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { categories } from '../../data/categories'
import type { CategoryId, Product, ProductColor } from '../../types/store'
import { cn, formatBDT, slugify, uid } from '../../utils/format'
import { compressImage } from '../../utils/image'
import { AdminNotFound, PageHeader, inputCls } from './shared'

const SIZE_PRESETS = [
  { label: 'S–XXL', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Waist 28–36', sizes: ['28', '30', '32', '34', '36'] },
  { label: 'One Size', sizes: ['One Size'] },
]

interface Draft {
  name: string
  slug: string
  slugEdited: boolean
  category: CategoryId
  description: string
  details: string
  price: string
  salePrice: string
  stock: string
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  isNew: boolean
  isBestSeller: boolean
  isFeatured: boolean
  hidden: boolean
}

const toDraft = (p?: Product): Draft => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  slugEdited: !!p,
  category: p?.category ?? 'tshirts',
  description: p?.description ?? '',
  details: p?.details.join('\n') ?? '',
  price: p ? String(p.price) : '',
  salePrice: p?.salePrice ? String(p.salePrice) : '',
  stock: p ? String(p.stock) : '',
  images: p?.images.length ? [...p.images] : [],
  sizes: p ? [...p.sizes] : ['S', 'M', 'L', 'XL', 'XXL'],
  colors: p ? p.colors.map((c) => ({ ...c })) : [{ name: 'Black', hex: '#111111' }],
  isNew: p?.isNew ?? true,
  isBestSeller: p?.isBestSeller ?? false,
  isFeatured: p?.isFeatured ?? false,
  hidden: p?.hidden ?? false,
})

const num = (s: string) => (s.trim() === '' ? null : Number(s))

export default function AdminProductEditor() {
  const { id } = useParams()
  const { getById } = useCatalog()
  const existing = id ? getById(id) : undefined
  if (id && !existing) return <AdminNotFound title="Product not found" text="It may have been deleted." />
  return <Editor key={id ?? 'new'} existing={existing} />
}

function Editor({ existing }: { existing?: Product }) {
  const { allProducts, saveProduct, deleteProduct } = useCatalog()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [d, setD] = useState<Draft>(() => toDraft(existing))
  const [tried, setTried] = useState(false)
  const [newImage, setNewImage] = useState('')
  const [newSize, setNewSize] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }))
  const setName = (name: string) => setD((prev) => ({ ...prev, name, slug: prev.slugEdited ? prev.slug : slugify(name) }))

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!d.name.trim()) e.name = 'Enter a product name.'
    const slug = slugify(d.slug || d.name)
    if (allProducts.some((p) => p.slug === slug && p.id !== existing?.id)) e.slug = 'Another product already uses this URL. Change it slightly.'
    const price = num(d.price)
    if (price === null || !(price > 0)) e.price = 'Enter a price greater than 0.'
    const sale = num(d.salePrice)
    if (sale !== null && (!(sale > 0) || (price !== null && sale >= price))) e.salePrice = 'Sale price must be lower than the regular price.'
    const stock = num(d.stock)
    if (stock === null || !Number.isInteger(stock) || stock < 0) e.stock = 'Enter stock as a whole number (0 or more).'
    if (!d.images.length) e.images = 'Add at least one photo.'
    if (!d.sizes.length) e.sizes = 'Add at least one size (use "One Size" if it has none).'
    if (!d.colors.length || d.colors.some((c) => !c.name.trim())) e.colors = 'Every colour needs a name.'
    return e
  }, [d, allProducts, existing?.id])
  const err = (k: string) => (tried ? errors[k] : undefined)

  const save = () => {
    setTried(true)
    if (Object.keys(errors).length) {
      notify('error', 'Please fix the highlighted fields', Object.values(errors)[0])
      return
    }
    const product: Product = {
      id: existing?.id ?? uid('prod'),
      slug: slugify(d.slug || d.name),
      name: d.name.trim(),
      category: d.category,
      description: d.description.trim(),
      details: d.details.split('\n').map((x) => x.trim()).filter(Boolean),
      price: Number(d.price),
      salePrice: num(d.salePrice) ?? undefined,
      images: d.images,
      sizes: d.sizes,
      colors: d.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
      stock: Number(d.stock),
      isNew: d.isNew,
      isBestSeller: d.isBestSeller,
      isFeatured: d.isFeatured,
      hidden: d.hidden,
    }
    saveProduct(product)
    notify('success', existing ? 'Product updated' : 'Product added', d.hidden ? 'Saved as hidden — not shown in the shop yet.' : 'It is now live in the shop.')
    navigate('/admin/products')
  }

  const addImageUrl = () => {
    const u = newImage.trim()
    if (!/^https?:\/\/\S+$/i.test(u)) {
      notify('error', 'Enter a full image link starting with https://')
      return
    }
    set('images', [...d.images, u])
    setNewImage('')
  }
  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const f of Array.from(files).slice(0, 6)) urls.push(await compressImage(f))
      set('images', [...d.images, ...urls])
      notify('success', `${urls.length} photo${urls.length === 1 ? '' : 's'} added`, 'Photos are compressed and stored in this browser.')
    } catch (e) {
      notify('error', 'Upload failed', e instanceof Error ? e.message : 'Could not read the image.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= d.images.length) return
    const next = [...d.images]
    ;[next[i], next[j]] = [next[j], next[i]]
    set('images', next)
  }
  const addSize = () => {
    const s = newSize.trim()
    if (!s || d.sizes.includes(s)) return setNewSize('')
    set('sizes', [...d.sizes, s])
    setNewSize('')
  }

  const price = num(d.price)
  const sale = num(d.salePrice)

  return (
    <>
      <PageHeader
        back={{ to: '/admin/products', label: 'Products' }}
        title={existing ? `Edit: ${existing.name}` : 'Add Product'}
        sub={existing ? 'Changes go live in the shop when you save.' : 'Fill in the details, then save to publish.'}
        actions={
          <>
            {existing && !existing.hidden && (
              <Link to={`/product/${existing.slug}`} target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium hover:bg-neutral-50">
                <ExternalLink className="h-4 w-4" /> View in shop
              </Link>
            )}
            <Button variant="primary" className="h-11 !bg-ink hover:!bg-ink-3" icon={<Save className="h-4 w-4" />} onClick={save}>
              {existing ? 'Save Changes' : 'Save Product'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Basic details" />
            <div className="space-y-5 p-5 sm:p-6">
              <TextField label="Product name" required value={d.name} onChange={(e) => setName(e.target.value)} error={err('name')} placeholder="e.g. Oversized Cotton Tee" autoFocus={!existing} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" required>
                  {(fid) => (
                    <select id={fid} value={d.category} onChange={(e) => set('category', e.target.value as CategoryId)} className={inputCls}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </Field>
                <TextField label="Page URL" value={d.slug} onChange={(e) => setD((p) => ({ ...p, slug: slugify(e.target.value), slugEdited: true }))} error={err('slug')} hint={`/product/${slugify(d.slug || d.name) || '…'}`} />
              </div>
              <TextAreaField label="Description" rows={4} value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="Fabric, fit and what makes it special." />
              <TextAreaField label="Details & care (one per line)" rows={4} value={d.details} onChange={(e) => set('details', e.target.value)} placeholder={'240 GSM cotton\nRelaxed fit\nMachine wash cold'} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Price & stock" />
            <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
              <TextField label="Regular price (৳)" required inputMode="decimal" value={d.price} onChange={(e) => set('price', e.target.value)} error={err('price')} placeholder="1290" />
              <TextField label="Sale price (৳)" inputMode="decimal" value={d.salePrice} onChange={(e) => set('salePrice', e.target.value)} error={err('salePrice')} placeholder="Optional" />
              <TextField label="Stock quantity" required inputMode="numeric" value={d.stock} onChange={(e) => set('stock', e.target.value)} error={err('stock')} placeholder="25" hint="Reduced automatically when an order is confirmed." />
            </div>
          </Card>

          <Card>
            <CardHeader title="Photos" description="The first photo is the main image. Use links or upload from your device." />
            <div className="space-y-4 p-5 sm:p-6">
              {d.images.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Product photos">
                  {d.images.map((src, i) => (
                    <li key={`${i}-${src.slice(-20)}`} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/10">
                      <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      {i === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">MAIN</span>}
                      <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                        <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="h-8 rounded bg-white/90 px-2 text-xs font-medium disabled:opacity-40" aria-label={`Move photo ${i + 1} earlier`}>←</button>
                        <button type="button" onClick={() => set('images', d.images.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded bg-white/90 text-red-600" aria-label={`Remove photo ${i + 1}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => moveImage(i, 1)} disabled={i === d.images.length - 1} className="h-8 rounded bg-white/90 px-2 text-xs font-medium disabled:opacity-40" aria-label={`Move photo ${i + 1} later`}>→</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="new-image" className="sr-only">Image link</label>
                <input id="new-image" type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} placeholder="https://… image link" className={cn(inputCls, 'flex-1', err('images') && 'border-red-500')} />
                <Button className="h-11" icon={<ImagePlus className="h-4 w-4" />} onClick={addImageUrl}>Add link</Button>
                <input ref={fileInput} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onUpload(e.target.files)} />
                <Button className="h-11" icon={<Upload className="h-4 w-4" />} onClick={() => fileInput.current?.click()} disabled={uploading}>{uploading ? 'Processing…' : 'Upload photos'}</Button>
              </div>
              {err('images') && <p className="text-xs text-red-600">{err('images')}</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Sizes & colours" description="Customers must choose one of each before ordering." />
            <div className="space-y-6 p-5 sm:p-6">
              <Field label="Sizes" error={err('sizes')}>
                {(fid) => (
                  <div>
                    <ul className="flex flex-wrap gap-2" aria-label="Sizes">
                      {d.sizes.map((s) => (
                        <li key={s} className="inline-flex h-9 items-center gap-1 rounded-lg bg-black/5 pr-1 pl-3 text-sm font-medium">
                          {s}
                          <button type="button" onClick={() => set('sizes', d.sizes.filter((x) => x !== s))} className="grid h-7 w-7 place-items-center rounded hover:bg-black/10" aria-label={`Remove size ${s}`}><X className="h-3.5 w-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input id={fid} value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} placeholder="Add size, e.g. 3XL" className={cn(inputCls, 'w-40')} />
                      <Button className="h-11" icon={<Plus className="h-4 w-4" />} onClick={addSize}>Add</Button>
                      {SIZE_PRESETS.map((p) => (
                        <button key={p.label} type="button" onClick={() => set('sizes', p.sizes)} className="min-h-11 rounded-lg px-3 text-xs font-medium text-teal-700 hover:bg-teal-50">Use {p.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </Field>

              <fieldset>
                <legend className="mb-1.5 text-[13px] font-medium text-neutral-700">Colours</legend>
                <ul className="space-y-2">
                  {d.colors.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <input type="color" value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '#000000'} onChange={(e) => set('colors', d.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="h-11 w-12 cursor-pointer rounded-lg border border-black/12 bg-white p-1" aria-label={`Colour ${i + 1} swatch`} />
                      <input value={c.name} onChange={(e) => set('colors', d.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Colour name, e.g. Navy" className={cn(inputCls, 'flex-1')} aria-label={`Colour ${i + 1} name`} />
                      <button type="button" onClick={() => set('colors', d.colors.filter((_, j) => j !== i))} className="grid h-11 w-11 place-items-center rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600" aria-label={`Remove colour ${c.name || i + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
                {err('colors') && <p className="mt-1 text-xs text-red-600">{err('colors')}</p>}
                <Button className="mt-3 h-11" icon={<Plus className="h-4 w-4" />} onClick={() => set('colors', [...d.colors, { name: '', hex: '#cccccc' }])}>Add colour</Button>
              </fieldset>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Visibility & badges" />
            <div className="space-y-4 p-5">
              <Toggle label="Show in shop" description={d.hidden ? 'Hidden — only visible in the admin' : 'Visible to customers'} checked={!d.hidden} onChange={(v) => set('hidden', !v)} />
              <Toggle label="New arrival" description="NEW badge + home page" checked={d.isNew} onChange={(v) => set('isNew', v)} />
              <Toggle label="Best seller" description="Best Sellers on the home page" checked={d.isBestSeller} onChange={(v) => set('isBestSeller', v)} />
              <Toggle label="Featured" description="Sorted first in the shop" checked={d.isFeatured} onChange={(v) => set('isFeatured', v)} />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/5] bg-black/5">
              {d.images[0] ? <img src={d.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-sm text-neutral-500">No photo yet</span>}
              {d.isNew && <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">NEW</span>}
            </div>
            <div className="p-4">
              <p className="text-xs text-neutral-500">Shop preview</p>
              <p className="mt-1 font-semibold">{d.name || 'Product name'}</p>
              <p className="mt-1 text-sm">
                {sale && price && sale < price ? <><span className="font-semibold text-red-700">{formatBDT(sale)}</span> <span className="text-neutral-400 line-through">{formatBDT(price)}</span></> : price ? formatBDT(price) : '৳—'}
              </p>
              <div className="mt-2 flex gap-1.5">{d.colors.map((c, i) => <span key={i} className="h-3 w-3 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} title={c.name} />)}</div>
            </div>
          </Card>
          {existing && (
            <Button variant="ghost" className="h-11 w-full text-red-600 hover:!bg-red-50" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>Delete product</Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete product?"
        body={<><strong>{existing?.name}</strong> will be removed from the shop. This cannot be undone.</>}
        confirmLabel="Delete product"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (existing) deleteProduct(existing.id)
          setConfirmDelete(false)
          notify('success', 'Product deleted')
          navigate('/admin/products')
        }}
      />
    </>
  )
}
