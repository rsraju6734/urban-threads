import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardList, ExternalLink, LayoutDashboard, Menu, Package, PlusCircle, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { LogoMark } from '../components/store/Logo'
import { useOrders } from '../context/OrdersContext'
import { cn } from '../utils/format'
import { EASE, EASE_DRAWER } from '../components/ui/Reveal'

const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', Icon: ClipboardList },
  { to: '/admin/products', label: 'Products', Icon: Package },
  { to: '/admin/products/new', label: 'Add Product', Icon: PlusCircle, end: true },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
]

function Brand() {
  return (
    <Link to="/admin" className="flex min-h-11 items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white"><LogoMark className="h-5 w-5" /></span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold tracking-wide">URBAN THREADS</span>
        <span className="block text-[11px] text-neutral-500">Store Admin</span>
      </span>
    </Link>
  )
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { orders } = useOrders()
  const pending = orders.filter((o) => o.status === 'pending').length
  return (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="px-5 py-5"><Brand /></div>
      <ul className="space-y-1 px-3">
        {NAV.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn('relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors', isActive ? 'bg-black/[0.05] text-neutral-900' : 'text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900')
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{label}</span>
              {to === '/admin/orders' && pending > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white" aria-label={`${pending} pending`}>{pending}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-xl bg-amber-500/10 p-3.5 text-[12px] leading-relaxed text-amber-900">
          <p className="font-semibold">Saved in this browser</p>
          <p className="mt-1">Changes show on the shop in this browser. Use Settings → Backup to move data. A shared admin for every device needs a backend.</p>
        </div>
        <Link to="/" className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm text-neutral-600 transition-colors hover:bg-black/[0.03] hover:text-neutral-900">
          View store <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  )
}

export function AdminLayout() {
  const [mobileNav, setMobileNav] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    document.title = 'Admin — URBAN THREADS'
    return () => {
      document.title = 'URBAN THREADS — Style That Defines You'
    }
  }, [])
  useEffect(() => {
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-neutral-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/[0.06] bg-white lg:block">
        <SideNav />
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileNav(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.4, ease: EASE_DRAWER }} className="absolute inset-y-0 left-0 w-72 bg-white">
              <button onClick={() => setMobileNav(false)} className="absolute top-5 right-3 grid h-11 w-11 place-items-center rounded-lg hover:bg-black/5" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
              <SideNav onNavigate={() => setMobileNav(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-[#f6f5f2]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileNav(true)} className="grid h-11 w-11 place-items-center rounded-lg hover:bg-black/5 lg:hidden" aria-label="Open navigation" aria-expanded={mobileNav}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden"><Brand /></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/orders/new" className="hidden min-h-11 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-medium transition-colors hover:bg-neutral-50 sm:inline-flex">
              <ClipboardList className="h-4 w-4" /> Add Order
            </Link>
            <Link to="/admin/products/new" className="press inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-3.5 text-sm font-medium text-white transition-colors hover:bg-ink-3">
              <PlusCircle className="h-4 w-4" /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Product</span>
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.25, ease: EASE }} className="mx-auto max-w-6xl">
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
