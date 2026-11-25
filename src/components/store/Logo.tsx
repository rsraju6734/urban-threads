import { Link } from 'react-router-dom'
import { cn } from '../../utils/format'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M5 6h6v17a5 5 0 0 0 10 0V6h6v17a11 11 0 0 1-22 0z" fill="currentColor" />
      <path d="M24 6h12v5h-3v23h-6V11h-3z" fill="currentColor" opacity="0.92" />
    </svg>
  )
}

export function Logo({ light = true, className }: { light?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={cn('group flex min-h-11 items-center gap-2.5', light ? 'text-white' : 'text-ink', className)}
      aria-label="URBAN THREADS — home"
    >
      <LogoMark className="h-8 w-8" />
      <span className="flex flex-col text-[15px] leading-[1.02] font-extrabold tracking-[0.06em]">
        <span>URBAN</span>
        <span>THREADS</span>
      </span>
    </Link>
  )
}
