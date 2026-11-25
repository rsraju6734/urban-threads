import { MotionConfig } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CatalogProvider } from './context/CatalogContext'
import { OrdersProvider } from './context/OrdersContext'
import { ToastProvider } from './context/ToastContext'
import { StoreLayout } from './layouts/StoreLayout'
import HomePage from './pages/store/HomePage'
import ShopPage from './pages/store/ShopPage'
import ProductPage from './pages/store/ProductPage'
import CartPage from './pages/store/CartPage'
import AboutPage from './pages/store/AboutPage'
import ContactPage from './pages/store/ContactPage'
import FaqPage from './pages/store/FaqPage'
import NotFoundPage from './pages/store/NotFoundPage'
import MyOrdersPage from './pages/store/MyOrdersPage'

// The Client Studio is a separate private tool — loaded on demand so storefront visitors never download it.
const StudioApp = lazy(() => import('./pages/studio/StudioApp'))
// The store Admin panel (products + orders) is also loaded on demand.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

function StudioFallback({ label = 'Loading Khoka Tech Client Studio…' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0e0e10] text-neutral-400" role="status">
      <div className="flex items-center gap-3 text-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
        {label}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <CatalogProvider>
        <OrdersProvider>
        <HashRouter>
          <Routes>
            <Route
              path="/studio/*"
              element={
                <Suspense fallback={<StudioFallback />}>
                  <StudioApp />
                </Suspense>
              }
            />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<StudioFallback label="Loading URBAN THREADS Admin…" />}>
                  <AdminApp />
                </Suspense>
              }
            />
            <Route
              element={
                <CartProvider>
                  <StoreLayout />
                </CartProvider>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
        </OrdersProvider>
        </CatalogProvider>
      </ToastProvider>
    </MotionConfig>
  )
}
