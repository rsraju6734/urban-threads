import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { storeConfig } from '../../data/storeConfig'
import { formatBDT } from '../../utils/format'
import { WhatsappIcon } from '../ui/BrandIcons'
import { Drawer } from '../ui/Modal'
import { EASE } from '../ui/Reveal'
import { CheckoutModal } from './CheckoutModal'
import { QuantityStepper } from './ProductOptions'

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const goal = storeConfig.delivery.freeThreshold
  const pct = Math.min(100, (subtotal / goal) * 100)
  const left = goal - subtotal
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-neutral-600">
        <Truck className="h-4 w-4" aria-hidden />
        {left > 0 ? (
          <span>
            Add <strong className="text-ink">{formatBDT(left)}</strong> more for free delivery
          </span>
        ) : (
          <span className="font-medium text-emerald-700">You've unlocked free delivery!</span>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200">
        <motion.div className="h-full rounded-full bg-ink" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, count } = useCart()
  const [checkout, setCheckout] = useState(false)

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={closeCart}
        title={`Your Cart (${count})`}
        footer={
          items.length > 0 ? (
            <div className="space-y-4">
              <FreeDeliveryProgress subtotal={subtotal} />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatBDT(subtotal)}</span>
              </div>
              <p className="-mt-2 text-xs text-neutral-500">Delivery calculated at checkout.</p>
              <button
                onClick={() => {
                  closeCart()
                  setCheckout(true)
                }}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(37,211,102,0.9)]"
              >
                <WhatsappIcon className="h-5 w-5 transition-transform group-hover:scale-110" /> Checkout via WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/cart" onClick={closeCart} className="flex h-11 items-center justify-center rounded-lg border border-neutral-300 text-sm font-medium transition hover:border-ink">
                  View Cart
                </Link>
                <button onClick={closeCart} className="h-11 rounded-lg border border-neutral-300 text-sm font-medium transition hover:border-ink">
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : undefined
        }
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, ease: EASE, duration: 0.6 }} className="grid h-20 w-20 place-items-center rounded-full bg-ivory">
              <ShoppingBag className="h-8 w-8 text-stone" />
            </motion.div>
            <div>
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="mt-1 text-sm text-neutral-500">Discover pieces made to define your style.</p>
            </div>
            <Link to="/shop" onClick={closeCart} className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-3">
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-black/8 px-5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.key}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.35, ease: EASE } }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="flex gap-4 overflow-hidden py-5"
                >
                  <Link to={`/product/${item.slug}`} onClick={closeCart} className="shrink-0">
                    <img src={item.image} alt={item.name} className="h-28 w-[88px] rounded-lg object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${item.slug}`} onClick={closeCart} className="text-sm leading-snug font-semibold hover:underline">
                        {item.name}
                      </Link>
                      <button onClick={() => removeItem(item.key)} className="-mt-1 -mr-1 rounded-full p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Size: {item.size} · Color: {item.color}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <QuantityStepper size="sm" value={item.quantity} onChange={(n) => updateQuantity(item.key, n)} label={`Quantity for ${item.name}`} />
                      <p className="text-sm font-semibold tabular-nums">{formatBDT(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Drawer>
      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
    </>
  )
}
