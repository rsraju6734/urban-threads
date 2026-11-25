import type { Product } from '../../types/store'
import { discountPercent } from '../../data/products'
import { cn, formatBDT } from '../../utils/format'

export function PriceTag({ product, className, large }: { product: Product; className?: string; large?: boolean }) {
  const off = discountPercent(product)
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-1', className)}>
      <span className={cn('font-semibold tabular-nums', large ? 'text-2xl' : 'text-[15px]', !!product.salePrice && 'text-red-700')}>
        {formatBDT(product.salePrice ?? product.price)}
      </span>
      {!!product.salePrice && (
        <>
          <span className={cn('text-neutral-400 line-through tabular-nums', large ? 'text-base' : 'text-[13px]')}>{formatBDT(product.price)}</span>
          {large && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Save {off}%</span>}
        </>
      )}
    </div>
  )
}
