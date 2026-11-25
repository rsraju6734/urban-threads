import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { EASE, EASE_IN_OUT, SplitWords } from '../ui/Reveal'
import { LogoMark } from './Logo'

/** Scrolls to top on route change (keeps hash-router navigation feeling like page loads). */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export function BackToTop() {
  const [show, setShow] = useState(false)
  const { scrollYProgress } = useScroll()
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: EASE }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group fixed right-4 bottom-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-ink text-white shadow-xl sm:right-6 sm:bottom-6"
          aria-label="Back to top"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
            <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#c8a97e" strokeWidth="2" style={{ pathLength: scrollYProgress }} />
          </svg>
          <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/** Brand intro loader — shown once per browser session. */
export function PageLoader() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('ut-intro')
    } catch {
      return false
    }
  })
  useEffect(() => {
    if (!visible) return
    try {
      sessionStorage.setItem('ut-intro', '1')
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [visible])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink text-white"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: EASE_IN_OUT }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}>
              <LogoMark className="h-14 w-14" />
            </motion.div>
            <SplitWords text="URBAN THREADS" inView={false} delay={0.1} className="text-xl font-extrabold tracking-[0.3em]" />
            <motion.div className="h-px w-40 origin-left bg-sand" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Wraps each routed page with a soft fade/slide transition. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease: EASE }}>
      {children}
    </motion.div>
  )
}

/**
 * Section heading. Per impeccable's craft floor there is no eyebrow/kicker above the heading —
 * the heading carries its own weight. (`eyebrow` is accepted for backwards compatibility and ignored.)
 */
export function SectionHeading({ title, sub, action, align = 'left', dark }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode; align?: 'left' | 'center'; dark?: boolean }) {
  return (
    <div className={`mb-10 flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={align === 'center' ? 'max-w-2xl' : ''}>
        <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {sub && <p className={`mt-2 text-[15px] ${dark ? 'text-white/70' : 'text-neutral-600'}`}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
