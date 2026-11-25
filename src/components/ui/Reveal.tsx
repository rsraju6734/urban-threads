import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/*
 * Motion system (Emil Kowalski standards + taste-skill rules):
 * - strong ease-out for anything entering, an iOS-style curve for drawers
 * - UI motion stays under 300ms; only page heroes and the one or two "moments" a page deals run longer
 * - content does NOT fade in on scroll by default. A section opts in with `moment` — at most two per page.
 */
export const EASE = [0.23, 1, 0.32, 1] as const
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

type Dir = 'up' | 'down' | 'left' | 'right' | 'none'

const offset = (dir: Dir, d = 24) => {
  switch (dir) {
    case 'up': return { y: d }
    case 'down': return { y: -d }
    case 'left': return { x: d }
    case 'right': return { x: -d }
    default: return {}
  }
}

type Tag = 'div' | 'section' | 'li' | 'p' | 'span' | 'h2' | 'h3' | 'footer'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  dir?: Dir
  duration?: number
  as?: Tag
  amount?: number
  /** Only a page's dealt moment animates on scroll. Without it this renders as a plain element. */
  moment?: boolean
}

export function Reveal({ children, className, delay = 0, dir = 'up', duration = 0.8, as = 'div', amount = 0.25, moment }: RevealProps) {
  if (!moment) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, ...offset(dir) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

export const staggerParent = (stagger = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Child variant used by grids that animate as state feedback (e.g. after a filter change), never on scroll. */
export const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
}

/** Plain layout container. Kept as a component so grids stay readable; it no longer animates on scroll. */
export function Stagger({ children, className }: { children: ReactNode; className?: string; stagger?: number; amount?: number }) {
  return <div className={className}>{children}</div>
}

/** Image reveal for a page's dealt moment: a curtain wipes away while the photo settles. Static without `moment`. */
export function ImageReveal({ children, className, delay = 0, moment }: { children: ReactNode; className?: string; delay?: number; moment?: boolean }) {
  if (!moment) return <div className={`relative overflow-hidden ${className ?? ''}`}>{children}</div>
  return (
    <motion.div className={`relative overflow-hidden ${className ?? ''}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      <motion.div className="h-full w-full" variants={{ hidden: { scale: 1.08 }, show: { scale: 1, transition: { duration: 1.2, delay, ease: EASE } } }}>
        {children}
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute inset-0 origin-top bg-ivory"
        variants={{ hidden: { scaleY: 1 }, show: { scaleY: 0, transition: { duration: 0.9, delay, ease: EASE_IN_OUT } } }}
      />
    </motion.div>
  )
}

/**
 * Word-by-word rise. Runs once on page load (`inView={false}`, used by page heroes).
 * In ordinary section headings it renders static text — no identical entrance on every section.
 */
export function SplitWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  inView = true,
}: {
  text: string
  className?: string
  wordClassName?: string
  delay?: number
  stagger?: number
  inView?: boolean
}) {
  if (inView) return <span className={className}>{text}</span>
  const words = text.split(' ')
  return (
    <motion.span className={className} initial="hidden" animate="show" variants={staggerParent(stagger, delay)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className={`inline-block ${wordClassName ?? ''}`}
            variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.8, ease: EASE } } }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Thin rule between blocks. */
export function Separator({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`h-px bg-current opacity-15 ${className}`} />
}
