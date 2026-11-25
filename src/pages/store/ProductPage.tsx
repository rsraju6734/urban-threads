import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, RefreshCcw, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckoutModal } from '../../components/store/CheckoutModal'
import { SectionHeading } from '../../components/store/Extras'
import { PriceTag } from '../../components/store/PriceTag'
import { ProductBadges, ProductCard } from '../../components/store/ProductCard'
import { ColorPicker, QuantityStepper, SizePicker } from '../../components/store/ProductOptions'
import { EASE, Reveal, Stagger } from '../../components/ui/Reveal'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { categoryName } from '../../data/categories'
import { useCatalog } from '../../context/CatalogContext'
import { storeConfig } from '../../data/storeConfig'
import { cn, formatBDT } from '../../utils/format'
import NotFoundPage from './NotFoundPage'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { getBySlug } = useCatalog()
  const product = getBySlug(slug)
  if (!product || product.hidden) return <NotFoundPage message="We couldn't find that product. It may have sold out or moved." />
  return <ProductView key={product.id} slug={slug} />
}

function ProductView({ slug }: { slug: string }) {
  const { getBySlug, products } = useCatalog()
  const product = getBySlug(slug)!
  const navigate = useNavigate()
  const { addItem, openCart } = useCart()
  const { notify } = useToast()
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const [size, setSize] = useState('')
  const [color, setColor] = useState(product.colors.length === 1 ? product.colors[0].name : '')
  const [qty, setQty] = useState(1)
  const [tried, setTried] = useState(false)
  const [added, setAdded] = useState(false)
  const [checkout, setCheckout] = useState(false)

  useEffect(() => {
    document.title = `${product.name} — URBAN THREADS`
    return () => {
      document.title = 'URBAN THREADS — Style That Defines You'
    }
  }, [product.name])

  const related = [
    ...products.filter((p) => p.category === product.category && p.id !== product.id),
    ...products.filter((p) => p.category !== product.category && p.isBestSeller),
  ].slice(0, 4)

  const show = (i: number) => {
    setDir(i > active ? 1 : -1)
    setActive((i + product.images.length) % product.images.length)
  }

  const validate = () => {
    setTried(true)
    if (!size || !color) {
      notify('error', 'Choose your options', `Please select a ${!size ? 'size' : 'color'} first.`)
      return false
    }
    return true
  }

  const add = () => {
    if (soldOut) return
    if (!validate()) return
    addItem({ product, size, color, quantity: qty })
    setAdded(true)
    notify('success', 'Added to cart', `${qty} × ${product.name} (${size}, ${color})`)
    setTimeout(() => setAdded(false), 2200)
  }

  const buyNow = () => {
    if (soldOut) return
    if (!validate()) return
    addItem({ product, size, color, quantity: qty })
    setCheckout(true)
  }

  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= 10

  return (
    <>
      <div className="container-x pt-6 pb-16 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link to="/shop" className="hover:text-ink">Shop</Link></li>
            <li aria-hidden>/</li>
            <li><Link to={`/shop?category=${product.category}`} className="hover:text-ink">{categoryName(product.category)}</Link></li>
            <li aria-hidden>/</li>
            <li className="text-ink" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <div className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => show(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === active}
                  className={cn('relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg transition duration-300 sm:w-full', i === active ? 'opacity-100' : 'opacity-50 hover:opacity-90')}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === active && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-lg ring-2 ring-ink ring-inset" transition={{ duration: 0.4, ease: EASE }} />}
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-cream">
              <AnimatePresence initial={false} custom={dir}>
                <motion.img
                  key={active}
                  src={product.images[active]}
                  alt={`${product.name} — image ${active + 1}`}
                  custom={dir}
                  initial={{ opacity: 0, scale: 1.02, x: dir * 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir * 40, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover"
                  drag={product.images.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) show(active + 1)
                    else if (info.offset.x > 60) show(active - 1)
                  }}
                />
              </AnimatePresence>
              <ProductBadges product={product} className="absolute top-4 left-4" />
              {product.images.length > 1 && (
                <div className="absolute right-4 bottom-4 flex gap-2">
                  <button onClick={() => show(active - 1)} className="grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white" aria-label="Previous image">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => show(active + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white" aria-label="Next image">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }} className="flex flex-col">
            <motion.h1 variants={item} className="text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</motion.h1>
            <motion.div variants={item} className="mt-5">
              <PriceTag product={product} large />
            </motion.div>
            <motion.p variants={item} className="mt-5 leading-relaxed text-neutral-600">{product.description}</motion.p>

            <motion.div variants={item} className="mt-8 space-y-6">
              <SizePicker sizes={product.sizes} value={size} onChange={setSize} error={tried && !size} />
              <ColorPicker colors={product.colors} value={color} onChange={setColor} error={tried && !color} />
              <div>
                <p className="mb-2.5 text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase">Quantity</p>
                <div className="flex items-center gap-4">
                  <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
                  <span className={cn('text-xs font-medium', soldOut ? 'text-red-700' : lowStock ? 'text-amber-700' : 'text-emerald-700')}>
                    {soldOut ? 'Sold out' : lowStock ? `Only ${product.stock} left in stock` : 'In stock — ready to ship'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-8 grid gap-3 sm:grid-cols-2">
              <button onClick={add} disabled={soldOut} className="relative flex h-13 items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-ink py-3.5 text-sm font-semibold transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 disabled:hover:bg-transparent">
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span key="ok" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Added to Cart
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Sold Out' : 'Add to Cart'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button onClick={buyNow} disabled={soldOut} className="group flex h-13 items-center justify-center gap-2 rounded-lg bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-ink-3 disabled:cursor-not-allowed disabled:bg-neutral-300">
                <Zap className="h-4 w-4 transition group-hover:text-sand" /> Buy Now
              </button>
            </motion.div>
            <AnimatePresence>
              {added && (
                <motion.button initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onClick={openCart} className="mt-3 text-left text-sm font-medium underline underline-offset-4">
                  View cart →
                </motion.button>
              )}
            </AnimatePresence>

            <motion.ul variants={item} className="mt-8 grid gap-3 rounded-xl bg-ivory p-5 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0" /> Free over {formatBDT(storeConfig.delivery.freeThreshold)}</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0" /> Cash on Delivery</li>
              <li className="flex items-center gap-2"><RefreshCcw className="h-4 w-4 shrink-0" /> 7-day exchange</li>
            </motion.ul>

            <motion.div variants={item} className="mt-8 border-t border-black/8 pt-6">
              <h2 className="text-sm font-semibold tracking-wide uppercase">Details & Care</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sand-dark" />{d}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-neutral-500">Delivery: {storeConfig.delivery.estimate}. Inside Dhaka {formatBDT(storeConfig.delivery.insideDhaka)}, outside Dhaka {formatBDT(storeConfig.delivery.outsideDhaka)}.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <section className="border-t border-black/8 bg-ivory/50 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading title="You may also like" action={<Reveal><button onClick={() => navigate(`/shop?category=${product.category}`)} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">More {categoryName(product.category)} →</button></Reveal>} />
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        </div>
      </section>

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
    </>
  )
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
