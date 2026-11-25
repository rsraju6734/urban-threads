import { motion } from 'framer-motion'
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/format'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#151517]', className)}>{children}</div>
}

export function CardHeader({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6 dark:border-white/[0.06]">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300">{icon}</span>}
        <div className="min-w-0">
          <h2 className="font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-teal-700 text-white hover:bg-teal-600',
  secondary: 'border border-black/10 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-100 dark:hover:bg-white/[0.08]',
  ghost: 'text-neutral-600 hover:bg-black/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.06]',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md'; icon?: ReactNode }>(
  function Button({ variant = 'secondary', size = 'md', icon, className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
          size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
          btnVariants[variant],
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    )
  },
)

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300',
    success: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    danger: 'bg-red-500/12 text-red-700 dark:text-red-300',
    info: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', tones[tone])}>{children}</span>
}

const fieldBase =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 transition placeholder:text-neutral-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 focus:outline-none dark:bg-[#0f0f11] dark:text-neutral-100 dark:placeholder:text-neutral-500'
const borderFor = (err?: string) => (err ? 'border-red-500 dark:border-red-500/80' : 'border-black/12 dark:border-white/10')

interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  )
}

type TF = { label: string; hint?: string; error?: string; required?: boolean; className?: string }

export function TextField({ label, hint, error, required, className, ...rest }: TF & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, d) => <input id={id} aria-describedby={d} aria-invalid={!!error} aria-required={required} className={cn(fieldBase, borderFor(error), 'h-10')} {...rest} />}
    </Field>
  )
}

export function TextAreaField({ label, hint, error, required, className, rows = 3, ...rest }: TF & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, d) => <textarea id={id} rows={rows} aria-describedby={d} aria-invalid={!!error} aria-required={required} className={cn(fieldBase, borderFor(error), 'resize-y leading-relaxed')} {...rest} />}
    </Field>
  )
}

export function SelectField({ label, hint, error, required, className, options, ...rest }: TF & SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id, d) => (
        <select id={id} aria-describedby={d} aria-invalid={!!error} className={cn(fieldBase, borderFor(error), 'h-10')} {...rest}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function ColorField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <Field label={label} error={error}>
      {(id, d) => (
        <div className={cn('flex h-10 items-center gap-2 rounded-lg border bg-white pr-2 pl-1.5 dark:bg-[#0f0f11]', borderFor(error))}>
          <input
            type="color"
            aria-label={`${label} picker`}
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input id={id} aria-describedby={d} value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase focus:outline-none" maxLength={7} />
        </div>
      )}
    </Field>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-neutral-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-teal-700' : 'bg-neutral-300 dark:bg-white/15')}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} />
      </button>
    </label>
  )
}

export function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
        active ? 'border-teal-700 bg-teal-700 text-white' : 'border-black/12 hover:border-teal-400 dark:border-white/12 dark:hover:border-teal-400',
      )}
    >
      {children}
    </button>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">{icon}</span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
