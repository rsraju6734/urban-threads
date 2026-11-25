import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, Search, ShoppingBag, X, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { categories } from '../../data/categories'
import { effectivePrice } from '../../data/products'
import { useCatalog } from '../../context/CatalogContext'
import { storeConfig } from '../../data/storeConfig'
import { useCart } from '../../context/CartContext'
import { cn, formatBDT } from '../../utils/format'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import { WhatsappIcon } from '../ui/BrandIcons'
import { Drawer } from '../ui/Modal'
import { EASE } from '../ui/Reveal'
import { Logo } from './Logo'
import { SocialLinks } from './SocialLinks'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop', dropdown: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const { count, openCart, addPulse } = useCart()
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setShopOpen(false)
  }, [pathname])

  const solid = !isHome || scrolled || searchOpen

  const openShop = () => {
    window.clearTimeout(closeTimer.current)
    setShopOpen(true)
  }
  const closeShopSoon = () => {
    closeTimer.current = window.setTimeout(() => setShopOpen(false), 140)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 text-white transition-[background-color,box-shadow,backdrop-filter] duration-500',
          solid ? 'bg-ink/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md' : 'bg-transparent',
        )}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-4 lg:h-[76px]">
          <div className="flex items-center gap-3">
            <button
              className="-ml-2 grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-[14px] font-medium">
              {NAV.map((item) =>
                item.dropdown ? (
                  <li key={item.to} className="relative" onMouseEnter={openShop} onMouseLeave={closeShopSoon}>
                    <div className="flex items-center gap-1">
                      <NavLink to={item.to} className={({ isActive }) => cn('link-underline py-2', isActive ? 'text-white' : 'text-white/80 hover:text-white')}>
                        {item.label}
                      </NavLink>
                      <button
                        className="rounded p-1 text-white/70 hover:text-white"
                        aria-label="Show shop categories"
                        aria-expanded={shopOpen}
                        onClick={() => setShopOpen((v) => !v)}
                        onFocus={openShop}
                      >
                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', shopOpen && 'rotate-180')} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {shopOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, clipPath: 'inset(0 0 100% 0)' }}
                          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                          exit={{ opacity: 0, y: 4, clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.12 } }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="absolute top-full left-1/2 mt-4 w-[560px] -translate-x-1/2 rounded-2xl bg-white p-3 text-ink shadow-2xl ring-1 ring-black/5"
                        >
                          <div className="grid grid-cols-[1fr_200px] gap-3">
                            <ul className="grid grid-cols-1 gap-0.5 p-1">
                              {categories.map((c, i) => (
                                <motion.li key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 + i * 0.03, ease: EASE, duration: 0.2 }}>
                                  <Link
                                    to={`/shop?category=${c.id}`}
                                    onClick={() => setShopOpen(false)}
                                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition hover:bg-ivory"
                                  >
                                    <span>
                                      <span className="block font-semibold">{c.name}</span>
                                      <span className="block text-xs text-neutral-500">{c.description}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                                  </Link>
                                </motion.li>
                              ))}
                            </ul>
                            <Link
                              to="/shop?sort=new"
                              onClick={() => setShopOpen(false)}
                              className="group relative overflow-hidden rounded-xl bg-ink"
                            >
                              <img src={categories[0].image} alt="" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
                              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                                <span className="eyebrow block text-sand">New In</span>
                                <span className="mt-1 block text-lg font-bold">Shop All Arrivals</span>
                              </span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('link-underline py-2', isActive ? 'text-white' : 'text-white/80 hover:text-white')}>
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden items-center gap-3 rounded-full bg-white/10 py-2 pr-3 pl-4 text-[13px] whitespace-nowrap text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 lg:flex"
              aria-label="Search products"
              aria-expanded={searchOpen}
            >
              <span className="w-28 text-left lg:w-36">Search products...</span>
              <Search className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10 lg:hidden"
              aria-expanded={searchOpen}
              aria-label="Search products"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <motion.button
              key={addPulse}
              onClick={openCart}
              className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
              initial={addPulse ? { scale: 1 } : false}
              animate={addPulse ? { scale: [1, 1.12, 1] } : undefined}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute top-0.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <a
              href={buildWhatsAppUrl(`Hello ${storeConfig.brandName}! I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 w-11 place-items-center rounded-full text-[#25D366] transition-colors hover:bg-white/10 sm:grid"
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsappIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <AnimatePresence>{searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}</AnimatePresence>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left" widthClass="max-w-[340px]">
        <nav aria-label="Mobile" className="flex h-full flex-col">
          <ul className="px-3 py-4">
            {NAV.map((item, i) => (
              <motion.li key={item.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04, ease: EASE, duration: 0.3 }}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn('block rounded-lg px-3 py-3 text-2xl font-bold tracking-tight transition', isActive ? 'text-ink' : 'text-neutral-400 hover:text-ink')}
                >
                  {item.label}
                </NavLink>
              </motion.li>
            ))}
          </ul>
          <div className="border-t border-black/8 px-6 py-5">
            <p className="eyebrow mb-3 text-neutral-500">Categories</p>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.id}`} className="block rounded-lg bg-ivory px-3 py-2.5 text-sm font-medium transition hover:bg-cream">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto border-t border-black/8 px-6 py-5">
            <SocialLinks iconClass="h-5 w-5" className="gap-5" />
          </div>
        </nav>
      </Drawer>
    </>
  )
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { products } = useCatalog()
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return products.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(s)).slice(0, 5)
  }, [q, products])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="overflow-hidden border-t border-white/10 bg-ink"
    >
      <div className="container-x py-6">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
            onClose()
          }}
          className="flex items-center gap-3 border-b border-white/25 pb-3"
        >
          <Search className="h-5 w-5 text-white/60" aria-hidden />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tees, hoodies, denim..."
            className="min-w-0 flex-1 bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none sm:text-2xl"
          />
          <button type="submit" className="min-h-11 rounded-full bg-white px-5 text-xs font-semibold text-ink transition-colors hover:bg-sand">
            Search
          </button>
        </form>
        {q.trim() && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {results.length === 0 && <li className="text-sm text-white/60">No products match “{q}”. Try “tee” or “jacket”.</li>}
            {results.map((p, i) => (
              <motion.li key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/10">
                  <img src={p.images[0]} alt="" className="h-14 w-11 rounded object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-white/60">{formatBDT(effectivePrice(p))}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
