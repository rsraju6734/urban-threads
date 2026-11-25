import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import type { ProductColor } from '../../types/store'
import { cn } from '../../utils/format'

export function SizePicker({ sizes, value, onChange, error }: { sizes: string[]; value: string; onChange: (s: string) => void; error?: boolean }) {
  const pillId = useId()
  return (
    <fieldset>
      <legend className={cn('mb-2.5 text-xs font-semibold tracking-[0.18em] uppercase', error ? 'text-red-600' : 'text-neutral-500')}>
        Size{value && <span className="ml-2 tracking-normal text-ink normal-case">— {value}</span>}
        {error && <span className="ml-2 tracking-normal normal-case">Please select a size</span>}
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((s) => {
          const active = s === value
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(s)}
              className={cn(
                'relative h-11 min-w-12 rounded-lg border px-3 text-sm font-medium transition-colors duration-200',
                active ? 'border-ink text-white' : 'border-neutral-300 text-ink hover:border-ink',
              )}
            >
              {active && <motion.span layoutId={`size-pill-${pillId}`} className="absolute inset-0 rounded-[7px] bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{s}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ColorPicker({ colors, value, onChange, error }: { colors: ProductColor[]; value: string; onChange: (c: string) => void; error?: boolean }) {
  return (
    <fieldset>
      <legend className={cn('mb-2.5 text-xs font-semibold tracking-[0.18em] uppercase', error ? 'text-red-600' : 'text-neutral-500')}>
        Color{value && <span className="ml-2 tracking-normal text-ink normal-case">— {value}</span>}
        {error && <span className="ml-2 tracking-normal normal-case">Please select a color</span>}
      </legend>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color">
        {colors.map((c) => {
          const active = c.name === value
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.name)}
              className={cn(
                'grid h-11 w-11 place-items-center rounded-full ring-1 transition-[box-shadow,scale] duration-200',
                active ? 'ring-2 ring-ink ring-offset-2' : 'ring-black/15 hover:scale-110',
              )}
            >
              <span className="h-9 w-9 rounded-full" style={{ background: c.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function QuantityStepper({ value, onChange, max = 99, size = 'md', label = 'Quantity' }: { value: number; onChange: (n: number) => void; max?: number; size?: 'sm' | 'md'; label?: string }) {
  const h = size === 'sm' ? 'h-11' : 'h-12'
  return (
    <div className={cn('inline-flex items-center rounded-lg border border-neutral-300', h)} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} className="grid h-full w-11 place-items-center transition-colors hover:bg-neutral-100 disabled:opacity-30" aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="relative w-9 overflow-hidden text-center text-sm font-semibold tabular-nums" aria-live="polite">
        <motion.span key={value} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="block">
          {value}
        </motion.span>
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-full w-11 place-items-center transition-colors hover:bg-neutral-100 disabled:opacity-30" aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
