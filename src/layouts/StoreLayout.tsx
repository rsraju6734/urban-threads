import { AnimatePresence } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnnouncementBar } from '../components/store/AnnouncementBar'
import { CartDrawer } from '../components/store/CartDrawer'
import { BackToTop, PageLoader, PageTransition, ScrollToTop } from '../components/store/Extras'
import { Footer } from '../components/store/Footer'
import { Navbar } from '../components/store/Navbar'

export function StoreLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div className="flex min-h-screen flex-col">
      {/* button instead of #anchor: hash links would be treated as routes by HashRouter */}
      <button
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only z-[300] rounded bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </button>
      <PageLoader />
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </div>
  )
}
