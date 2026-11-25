import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  kind: ToastKind
  title: string
  message?: string
}

interface ToastCtx {
  notify: (kind: ToastKind, title: string, message?: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info }
const tone = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-sky-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notify = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t.slice(-3), { id, kind, title, message }])
      setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3800)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = icons[t.kind]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                role="status"
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-black/5 bg-white p-4 text-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)]"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone[t.kind]}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-sm text-neutral-600">{t.message}</p>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
