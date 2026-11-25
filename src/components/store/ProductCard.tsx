import { motion } from 'framer-motion'
import { Eye, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/store'
import { discountPercent } from '../../data/products'
import { cn } from '../../utils/format'
import { fadeUpChild } from '../ui/Reveal'
import { PriceTag } from './PriceTag'
import { QuickViewModal } from './QuickViewModal'

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const off = discountPercent(product)
  return (
    <div className={cn('pointer-events-none flex flex-col items-start gap-1.5', className)}>
      {product.isNew && (
        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
        >
          New
        </span>
      )}
      {product.stock <= 0 && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink uppercase">Sold out</span>}
      {off > 0 && (
        <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
        >
          Sale −{off}%
        </span>
      )}
    </div>
  )
}

/** Product tile. Must be rendered inside a <Stagger> (or any parent with hidden/show variants). */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [quick, setQuick] = useState(false)
  const second = product.images[1]

  return (
    <motion.article variants={fadeUpChild} className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-xl bg-cream transition-[translate] duration-200 ease-[var(--ease-luxe)] [@media(hover:hover)]:group-hover:-translate-y-0.5">
        <Link to={`/product/${product.slug}`} className="block aspect-[4/5]" aria-label={product.name}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-[scale] duration-500 ease-[var(--ease-luxe)] group-hover:scale-[1.03]"
          />
          {second && (
            <img
              src={second}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-[var(--ease-luxe)] group-hover:opacity-100"
            />
          )}
        </Link>
        <ProductBadges product={product} className="absolute top-3 left-3" />

        {/* Quick actions slide up on hover (always visible on touch screens) */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition-[opacity,translate] duration-200 ease-[var(--ease-luxe)] [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          <button
            onClick={() => setQuick(true)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/95 text-xs font-semibold tracking-wide text-ink uppercase shadow-lg backdrop-blur transition-colors duration-200 hover:bg-ink hover:text-white"
          >
            <Plus className="h-4 w-4" /> Quick Add
          </button>
          <button
            onClick={() => setQuick(true)}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-lg backdrop-blur transition hover:bg-ink hover:text-white"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <h3 className="text-[15px] leading-snug font-semibold">
          <Link to={`/product/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <PriceTag product={product} />
        </div>
        <div className="mt-2.5 flex gap-1.5" aria-label="Available colors">
          {product.colors.map((c) => (
            <span key={c.name} title={c.name} className="h-3 w-3 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} />
          ))}
        </div>
      </div>

      <QuickViewModal product={product} open={quick} onClose={() => setQuick(false)} />
    </motion.article>
  )
}
