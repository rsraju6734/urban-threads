export type CategoryId = 'tshirts' | 'hoodies' | 'shirts' | 'polos' | 'pants' | 'jackets'

export interface Category {
  id: CategoryId
  name: string
  /** Two-line label used on homepage category tiles */
  label: [string, string?]
  image: string
  description: string
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategoryId
  description: string
  details: string[]
  /** Regular price in BDT */
  price: number
  /** Discounted price in BDT (optional) */
  salePrice?: number
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  stock: number
  isNew?: boolean
  isBestSeller?: boolean
  isFeatured?: boolean
  /** hidden products stay in the admin but are not shown in the shop */
  hidden?: boolean
}

export interface CartItem {
  /** productId + size + color */
  key: string
  productId: string
  slug: string
  name: string
  image: string
  unitPrice: number
  size: string
  color: string
  quantity: number
}

export type DeliveryArea = 'inside' | 'outside'

export interface CheckoutDetails {
  name: string
  phone: string
  address: string
  area: DeliveryArea
  notes: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type OrderSource = 'website' | 'whatsapp' | 'manual'

export interface OrderItem {
  productId: string
  slug: string
  name: string
  image: string
  unitPrice: number
  size: string
  color: string
  quantity: number
}

export interface Order {
  id: string
  /** short human reference, also printed in the WhatsApp message (e.g. UT-K3F9QX) */
  ref: string
  createdAt: string
  updatedAt: string
  status: OrderStatus
  source: OrderSource
  customer: { name: string; phone: string; address: string; area: DeliveryArea }
  notes: string
  items: OrderItem[]
  subtotal: number
  delivery: number
  total: number
  /** true once stock has been deducted for this order (on confirmation) */
  stockDeducted: boolean
  history: { status: OrderStatus; at: string; note?: string }[]
  adminNote: string
}
