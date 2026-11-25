import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Order, OrderStatus } from '../types/store'
import { readStorage, writeStorage } from '../utils/storage'
import { uid } from '../utils/format'
import { useCatalog } from './CatalogContext'

/**
 * Orders: created automatically when a customer sends a WhatsApp order from this browser,
 * added manually in the Admin panel, or imported by pasting a WhatsApp order message.
 * Stored in localStorage (this browser only).
 */
const KEY = 'urban-threads:orders:v1'
const MY_KEY = 'urban-threads:my-orders:v1'

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
/** statuses that mean the goods are committed — stock is deducted when an order first reaches one of these */
const COMMITTED: OrderStatus[] = ['confirmed', 'shipped', 'delivered']

export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'stockDeducted' | 'history' | 'adminNote' | 'status'> & { status?: OrderStatus; adminNote?: string; createdAt?: string }

interface OrdersCtx {
  orders: Order[]
  /** refs of orders placed from this browser by the shopper (for "My orders") */
  myOrderRefs: string[]
  createOrder: (o: NewOrder, opts?: { mine?: boolean }) => Order
  setStatus: (id: string, status: OrderStatus, note?: string) => void
  updateOrder: (id: string, patch: Partial<Pick<Order, 'adminNote' | 'customer' | 'notes'>>) => void
  deleteOrder: (id: string) => void
  replaceOrders: (list: Order[]) => void
}

const Ctx = createContext<OrdersCtx | null>(null)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { adjustStock } = useCatalog()
  const [orders, setOrders] = useState<Order[]>(() => readStorage<Order[]>(KEY, []))
  const [myOrderRefs, setMy] = useState<string[]>(() => readStorage<string[]>(MY_KEY, []))
  // latest orders for event handlers — stock side effects must run once, never inside a state updater
  const ordersRef = useRef(orders)
  ordersRef.current = orders

  useEffect(() => {
    writeStorage(KEY, orders)
  }, [orders])
  useEffect(() => {
    writeStorage(MY_KEY, myOrderRefs)
  }, [myOrderRefs])
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === KEY) setOrders(readStorage<Order[]>(KEY, []))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const createOrder = useCallback(
    (o: NewOrder, opts?: { mine?: boolean }) => {
      const now = new Date().toISOString()
      const status = o.status ?? 'pending'
      const order: Order = {
        ...o,
        id: uid('order'),
        createdAt: o.createdAt ?? now,
        updatedAt: now,
        status,
        stockDeducted: false,
        history: [{ status, at: now, note: o.source === 'website' ? 'Placed on the website' : o.source === 'whatsapp' ? 'Imported from WhatsApp message' : 'Added by admin' }],
        adminNote: o.adminNote ?? '',
      }
      if (COMMITTED.includes(status)) {
        adjustStock(order.items.map((i) => ({ productId: i.productId, delta: -i.quantity })))
        order.stockDeducted = true
      }
      ordersRef.current = [order, ...ordersRef.current]
      setOrders(ordersRef.current)
      if (opts?.mine) setMy((prev) => [order.ref, ...prev])
      return order
    },
    [adjustStock],
  )

  const setStatus = useCallback(
    (id: string, status: OrderStatus, note?: string) => {
      const o = ordersRef.current.find((x) => x.id === id)
      if (!o || o.status === status) return
      let stockDeducted = o.stockDeducted
      if (COMMITTED.includes(status) && !stockDeducted) {
        adjustStock(o.items.map((i) => ({ productId: i.productId, delta: -i.quantity })))
        stockDeducted = true
      }
      if ((status === 'cancelled' || status === 'pending') && stockDeducted) {
        adjustStock(o.items.map((i) => ({ productId: i.productId, delta: i.quantity })))
        stockDeducted = false
      }
      const at = new Date().toISOString()
      const next: Order = { ...o, status, stockDeducted, updatedAt: at, history: [...o.history, { status, at, note }] }
      ordersRef.current = ordersRef.current.map((x) => (x.id === id ? next : x))
      setOrders(ordersRef.current)
    },
    [adjustStock],
  )

  const updateOrder = useCallback((id: string, patch: Partial<Pick<Order, 'adminNote' | 'customer' | 'notes'>>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)))
  }, [])

  const deleteOrder = useCallback(
    (id: string) => {
      const o = ordersRef.current.find((x) => x.id === id)
      if (!o) return
      // deleting a committed order gives its stock back
      if (o.stockDeducted) adjustStock(o.items.map((i) => ({ productId: i.productId, delta: i.quantity })))
      ordersRef.current = ordersRef.current.filter((x) => x.id !== id)
      setOrders(ordersRef.current)
    },
    [adjustStock],
  )

  const replaceOrders = useCallback((list: Order[]) => setOrders(list), [])

  const value = useMemo(() => ({ orders, myOrderRefs, createOrder, setStatus, updateOrder, deleteOrder, replaceOrders }), [orders, myOrderRefs, createOrder, setStatus, updateOrder, deleteOrder, replaceOrders])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOrders() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}
