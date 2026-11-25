import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../types/store'
import { products as demoProducts } from '../data/products'
import { readStorage, writeStorage } from '../utils/storage'

/**
 * Product catalog shared by the storefront and the Admin panel.
 * Seeded with the URBAN THREADS demo products; every admin change is saved in this browser's localStorage.
 * (A shared catalog for every visitor needs a backend — see README "Admin panel".)
 */
const KEY = 'urban-threads:catalog:v1'

interface CatalogCtx {
  /** every product, including hidden ones (admin view) */
  allProducts: Product[]
  /** products visible in the shop */
  products: Product[]
  storageOk: boolean
  getBySlug: (slug: string) => Product | undefined
  getById: (id: string) => Product | undefined
  saveProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  /** positive adds stock, negative removes (never below 0) */
  adjustStock: (changes: { productId: string; delta: number }[]) => void
  replaceCatalog: (list: Product[]) => void
  resetCatalog: () => void
}

const Ctx = createContext<CatalogCtx | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Product[]>(() => readStorage<Product[] | null>(KEY, null) ?? demoProducts)
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    setStorageOk(writeStorage(KEY, all))
  }, [all])

  // keep several open tabs (shop + admin) in sync
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === KEY) setAll(readStorage<Product[] | null>(KEY, null) ?? demoProducts)
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const getBySlug = useCallback((slug: string) => all.find((p) => p.slug === slug), [all])
  const getById = useCallback((id: string) => all.find((p) => p.id === id), [all])

  const saveProduct = useCallback((p: Product) => {
    setAll((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]))
  }, [])
  const deleteProduct = useCallback((id: string) => setAll((prev) => prev.filter((p) => p.id !== id)), [])
  const adjustStock = useCallback((changes: { productId: string; delta: number }[]) => {
    setAll((prev) =>
      prev.map((p) => {
        const d = changes.filter((c) => c.productId === p.id).reduce((s, c) => s + c.delta, 0)
        return d ? { ...p, stock: Math.max(0, p.stock + d) } : p
      }),
    )
  }, [])
  const replaceCatalog = useCallback((list: Product[]) => setAll(list), [])
  const resetCatalog = useCallback(() => setAll(demoProducts), [])

  const value = useMemo<CatalogCtx>(
    () => ({
      allProducts: all,
      products: all.filter((p) => !p.hidden),
      storageOk,
      getBySlug,
      getById,
      saveProduct,
      deleteProduct,
      adjustStock,
      replaceCatalog,
      resetCatalog,
    }),
    [all, storageOk, getBySlug, getById, saveProduct, deleteProduct, adjustStock, replaceCatalog, resetCatalog],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider')
  return ctx
}
