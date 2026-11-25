import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FreeDeliveryProgress } from '../../components/store/CartDrawer'
import { CheckoutModal } from '../../components/store/CheckoutModal'
import { QuantityStepper } from '../../components/store/ProductOptions'
import { WhatsappIcon } from '../../components/ui/BrandIcons'
import { Modal } from '../../components/ui/Modal'
import { EASE, SplitWords } from '../../components/ui/Reveal'
import { useCart } from '../../context/CartContext'
import { storeConfig } from '../../data/storeConfig'
import { formatBDT } from '../../utils/format'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, count, clear } = useCart()
  const [checkout, setCheckout] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            <SplitWords text="Your Cart" inView={false} />
          </h1>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE, duration: 0.7 }} className="flex flex-col items-center rounded-2xl bg-ivory px-6 py-24 text-center">
          <ShoppingBag className="h-10 w-10 text-stone" />
          <p className="mt-4 text-xl font-semibold">Your cart is empty</p>
          <p className="mt-1 text-sm text-neutral-500">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="mt-6 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-3">Explore the Collection</Link>
        </motion.div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-black/10 pb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase sm:grid">
              <span>Product</span><span>Quantity</span><span className="text-right">Total</span><span />
            </div>
            <ul>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, transition: { duration: 0.35, ease: EASE } }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="grid grid-cols-[88px_1fr] gap-4 overflow-hidden border-b border-black/8 py-6 sm:grid-cols-[1fr_140px_120px_40px] sm:items-center"
                  >
                    <div className="contents sm:flex sm:items-center sm:gap-4">
                      <Link to={`/product/${item.slug}`} className="row-span-2 shrink-0 sm:row-span-1">
                        <img src={item.image} alt={item.name} className="h-28 w-[88px] rounded-lg object-cover" />
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/product/${item.slug}`} className="font-semibold hover:underline">{item.name}</Link>
                        <p className="mt-1 text-sm text-neutral-500">Size: {item.size} · Color: {item.color}</p>
                        <p className="mt-1 text-sm text-neutral-500">{formatBDT(item.unitPrice)} each</p>
                      </div>
                    </div>
                    <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-auto sm:contents">
                      <QuantityStepper size="sm" value={item.quantity} onChange={(n) => updateQuantity(item.key, n)} label={`Quantity for ${item.name}`} />
                      <p className="font-semibold tabular-nums sm:text-right">{formatBDT(item.unitPrice * item.quantity)}</p>
                      <button onClick={() => removeItem(item.key)} className="rounded-full p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <button onClick={() => setConfirmClear(true)} className="mt-6 text-sm text-neutral-500 underline-offset-4 hover:text-red-600 hover:underline">Clear cart</button>
          </div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: EASE }} className="h-fit rounded-2xl bg-ivory p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-600">Items</dt><dd>{count}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd className="font-semibold tabular-nums">{formatBDT(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-600">Delivery</dt><dd className="text-right text-neutral-600">{subtotal >= storeConfig.delivery.freeThreshold ? 'FREE' : `${formatBDT(storeConfig.delivery.insideDhaka)} / ${formatBDT(storeConfig.delivery.outsideDhaka)}`}</dd></div>
            </dl>
            <div className="mt-5"><FreeDeliveryProgress subtotal={subtotal} /></div>
            <button onClick={() => setCheckout(true)} className="group mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(37,211,102,0.9)]">
              <WhatsappIcon className="h-5 w-5 transition-transform group-hover:scale-110" /> Proceed to WhatsApp Checkout
            </button>
            <Link to="/shop" className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border border-neutral-300 text-sm font-semibold transition hover:border-ink">Continue Shopping</Link>
            <p className="mt-4 text-xs leading-relaxed text-neutral-500">Cash on Delivery. Your order is confirmed in WhatsApp — we never ask for card details on this website.</p>
          </motion.aside>
        </div>
      )}

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear your cart?"
        description="All items will be removed from your cart."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmClear(false)} className="h-10 rounded-lg px-4 text-sm font-medium hover:bg-neutral-100">Cancel</button>
            <button onClick={() => { clear(); setConfirmClear(false) }} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">Clear cart</button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">You can always add products again from the shop.</p>
      </Modal>
    </div>
  )
}
