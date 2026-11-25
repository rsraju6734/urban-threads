import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ExternalLink, LayoutDashboard, Menu, Moon, PlusCircle, Sun, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { useStudio } from '../context/StudioContext'
import { cn } from '../utils/format'

const NAV = [
  { to: '/studio', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/studio/clients', label: 'Client Projects', Icon: Users },
  { to: '/studio/new', label: 'Create New Client', Icon: PlusCircle },
  { to: '/studio/guide', label: 'Guide & Workflow', Icon: BookOpen },
]

function Brand() {
  return (
    <Link to="/studio" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">KT</span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">Khoka Tech</span>
        <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Client Studio</span>
      </span>
    </Link>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { profiles } = useStudio()
  return (
    <nav aria-label="Studio" className="flex h-full flex-col">
      <div className="px-5 py-5"><Brand /></div>
      <ul className="space-y-1 px-3">
        {NAV.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-black/[0.03] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="studio-nav" className="absolute inset-0 rounded-lg bg-black/[0.05] ring-1 ring-black/[0.04] dark:bg-white/[0.07] dark:ring-white/[0.06]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon className={cn('relative h-[18px] w-[18px]', isActive && 'text-teal-700 dark:text-teal-400')} />
                  <span className="relative flex-1">{label}</span>
                  {to === '/studio/clients' && profiles.length > 0 && <span className="relative rounded-full bg-black/5 px-2 py-0.5 text-[11px] dark:bg-white/10">{profiles.length}</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-xl bg-amber-500/10 p-3.5 text-[12px] leading-relaxed text-amber-800 dark:text-amber-200/90">
          <p className="font-semibold">Local storage only</p>
          <p className="mt-1 opacity-90">Profiles live in this browser only. Export JSON regularly as a backup.</p>
        </div>
        <Link to="/" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-white">
          View demo storefront <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  )
}

export function StudioLayout() {
  const { theme, toggleTheme } = useStudio()
  const [mobileNav, setMobileNav] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()

  // apply theme to <html> so modals rendered in portals inherit it
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('studio-dark', theme === 'dark')
    root.style.colorScheme = theme
    document.title = 'Khoka Tech — Client Studio'
    return () => {
      root.classList.remove('studio-dark')
      root.style.colorScheme = ''
      document.title = 'URBAN THREADS — Style That Defines You'
    }
  }, [theme])

  useEffect(() => {
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-neutral-900 dark:bg-[#0c0c0e] dark:text-neutral-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/[0.06] bg-white/70 backdrop-blur lg:block dark:border-white/[0.06] dark:bg-[#111113]/80">
        <SidebarNav />
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-[#111113]"
            >
              <button onClick={() => setMobileNav(false)} className="absolute top-5 right-3 rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
              <SidebarNav onNavigate={() => setMobileNav(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-[#f5f5f3]/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-white/[0.06] dark:bg-[#0c0c0e]/80">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="rounded-lg p-2 hover:bg-black/5 lg:hidden dark:hover:bg-white/10" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden"><Brand /></div>
            <p className="hidden text-sm text-neutral-500 lg:block dark:text-neutral-400">Private business tool · Clothing website onboarding</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <Link to="/studio/new" className="hidden h-9 items-center gap-2 rounded-lg bg-teal-700 px-3.5 text-sm font-medium text-white transition hover:bg-teal-600 sm:inline-flex">
              <PlusCircle className="h-4 w-4" /> New Client
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl">
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
