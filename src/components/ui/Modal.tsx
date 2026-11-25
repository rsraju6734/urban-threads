import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/format'
import { EASE, EASE_DRAWER } from './Reveal'

function useLockAndEscape(open: boolean, onCloseProp: () => void, panel: React.RefObject<HTMLElement | null>) {
  // keep the latest onClose without re-running the effect (which would steal focus on every render)
  const closeRef = useRef(onCloseProp)
  closeRef.current = onCloseProp
  useEffect(() => {
    if (!open) return
    const onClose = () => closeRef.current()
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => {
      const el = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current
      el?.focus()
    }, 50)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      prevFocus?.focus?.()
    }
  }, [open, panel])
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** visual theme of the panel */
  tone?: 'light' | 'dark'
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

export function Modal({ open, onClose, title, description, children, footer, size = 'md', tone = 'light' }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  const id = useId()
  useLockAndEscape(open, onClose, panel)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: EASE }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl shadow-2xl outline-none sm:rounded-2xl',
              sizes[size],
              tone === 'dark' ? 'bg-[#141416] text-neutral-100 ring-1 ring-white/10' : 'bg-white text-ink',
            )}
          >
            <div className={cn('flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6', tone === 'dark' ? 'border-white/10' : 'border-black/8')}>
              <div className="min-w-0">
                <h2 id={`${id}-t`} className="text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                {description && <p className={cn('mt-0.5 text-sm', tone === 'dark' ? 'text-neutral-400' : 'text-neutral-500')}>{description}</p>}
              </div>
              <button
                onClick={onClose}
                className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors', tone === 'dark' ? 'hover:bg-white/10' : 'hover:bg-neutral-100')}
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className={cn('border-t px-5 py-4 sm:px-6', tone === 'dark' ? 'border-white/10' : 'border-black/8')}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  side?: 'right' | 'left'
  widthClass?: string
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', widthClass = 'max-w-md' }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const id = useId()
  useLockAndEscape(open, onClose, panel)
  const from = side === 'right' ? '100%' : '-100%'
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            tabIndex={-1}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ duration: 0.4, ease: EASE_DRAWER }}
            className={cn('absolute top-0 flex h-full w-full flex-col bg-white shadow-2xl outline-none', widthClass, side === 'right' ? 'right-0' : 'left-0')}
          >
            <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
              <h2 id={`${id}-t`} className="text-base font-semibold tracking-wide uppercase">
                {title}
              </h2>
              <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-neutral-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-black/8 p-5">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
