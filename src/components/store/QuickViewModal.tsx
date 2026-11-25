import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/store'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { Modal } from '../ui/Modal'
import { PriceTag } from './PriceTag'
import { ColorPicker, QuantityStepper, SizePicker } from './ProductOptions'

export function QuickViewModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { addItem, openCart } = useCart()
  const { notify } = useToast()
  const [size, setSize] = useState('')
  const [color, setColor] = useState(product.colors.length === 1 ? product.colors[0].name : '')
  const [qty, setQty] = useState(1)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (open) {
      setSize('')
      setColor(product.colors.length === 1 ? product.colors[0].name : '')
      setQty(1)
      setTried(false)
    }
  }, [open, product])

  const add = () => {
    setTried(true)
    if (product.stock <= 0 || !size || !color) return
    addItem({ product, size, color, quantity: qty })
    notify('success', 'Added to cart', `${product.name} · ${size} · ${color}`)
    onClose()
    openCart()
  }

  return (
    <Modal open={open} onClose={onClose} title={product.name} description="Quick view" size="lg">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-cream">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-5">
          <PriceTag product={product} large />
          <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>
          <SizePicker sizes={product.sizes} value={size} onChange={setSize} error={tried && !size} />
          <ColorPicker colors={product.colors} value={color} onChange={setColor} error={tried && !color} />
          <div className="flex items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            <button
              onClick={add}
              disabled={product.stock <= 0}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition hover:bg-ink-3 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <ShoppingBag className="h-4 w-4" /> {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
          <Link to={`/product/${product.slug}`} onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
            View full details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Modal>
  )
}
