import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types/store'
import { effectivePrice } from '../data/products'
import { readStorage, writeStorage } from '../utils/storage'

const KEY = 'urban-threads:cart:v1'

interface AddArgs {
  product: Product
  size: string
  color: string
  quantity: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  subtotal: number
  /** increments every time something is added — drives the cart icon animation */
  addPulse: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (a: AddArgs) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStorage<CartItem[]>(KEY, []))
  const [isOpen, setOpen] = useState(false)
  const [addPulse, setPulse] = useState(0)

  useEffect(() => {
    writeStorage(KEY, items)
  }, [items])

  const addItem = useCallback(({ product, size, color, quantity }: AddArgs) => {
    const key = `${product.id}__${size}__${color}`
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          unitPrice: effectivePrice(product),
          size,
          color,
          quantity: Math.min(quantity, product.stock),
        },
      ]
    })
    setPulse((n) => n + 1)
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(99, quantity)) } : i)))
  }, [])

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      addPulse,
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, addPulse, isOpen, addItem, updateQuantity, removeItem, clear],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
