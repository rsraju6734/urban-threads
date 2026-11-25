import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import AdminDashboard from './AdminDashboard'
import AdminOrders from './AdminOrders'
import AdminOrderDetail from './AdminOrderDetail'
import AdminNewOrder from './AdminNewOrder'
import AdminProducts from './AdminProducts'
import AdminProductEditor from './AdminProductEditor'
import AdminSettings from './AdminSettings'
import { AdminNotFound } from './shared'

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/new" element={<AdminNewOrder />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductEditor />} />
        <Route path="products/:id" element={<AdminProductEditor />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
  )
}
