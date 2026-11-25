import type { AdditionalInfo, BrandDesign, BrandInfo, ClientProduct, ClientProfile, DesignStyle, FeatureKey, FeatureSelection, OrderDelivery, ThemePreference } from '../../types/studio'
import { FEATURE_KEYS } from '../../types/studio'
import { uid } from '../format'

export const DESIGN_STYLES: DesignStyle[] = ['Premium', 'Luxury', 'Minimalist', 'Streetwear', 'Modern', 'Casual']
export const THEMES: ThemePreference[] = ['Light', 'Dark', 'Light & Dark toggle', 'No preference']
export const TYPOGRAPHY_OPTIONS = [
  'Modern Sans (Inter / Helvetica style)',
  'Elegant Serif (Playfair / Didot style)',
  'Serif headings + Sans body',
  'Bold Condensed (streetwear)',
  'Geometric Sans (Montserrat / Poppins style)',
  'Client will provide fonts',
  'No preference',
]
export const PAYMENT_METHODS = ['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Card (via payment gateway)']
export const CATEGORY_SUGGESTIONS = ['T-Shirts', 'Polo Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jackets', 'Jeans', 'Pants', 'Shorts', 'Panjabi', 'Saree', 'Three-Piece', 'Kurti', 'Abaya', 'Kids', 'Accessories']

/** 'static' = works on a static site · 'partial' = basic static version possible, full version needs backend · 'backend' = requires backend/hosting */
export type FeatureLevel = 'static' | 'partial' | 'backend'

export const FEATURE_META: Record<FeatureKey, { label: string; level: FeatureLevel; note?: string; default: boolean }> = {
  homepage: { label: 'Homepage', level: 'static', default: true },
  catalog: { label: 'Product Catalog', level: 'static', default: true },
  productDetails: { label: 'Product Details', level: 'static', default: true },
  cart: { label: 'Shopping Cart', level: 'static', note: 'Stored in the visitor’s browser', default: true },
  whatsappOrdering: { label: 'WhatsApp Ordering', level: 'static', default: true },
  search: { label: 'Product Search', level: 'static', default: true },
  categoryFilter: { label: 'Category Filtering', level: 'static', default: true },
  sizeSelection: { label: 'Size Selection', level: 'static', default: true },
  colorSelection: { label: 'Color Selection', level: 'static', default: true },
  reviews: { label: 'Customer Reviews', level: 'partial', note: 'Displaying curated reviews is static; letting customers submit reviews needs a backend', default: false },
  about: { label: 'About Page', level: 'static', default: true },
  contact: { label: 'Contact Page', level: 'static', default: true },
  faq: { label: 'FAQ', level: 'static', default: true },
  deliveryInfo: { label: 'Delivery Information', level: 'static', default: true },
  coupons: { label: 'Discount Coupons', level: 'partial', note: 'Client-side codes can be seen by anyone; secure single-use coupons need a backend', default: false },
  adminDashboard: { label: 'Admin Dashboard', level: 'backend', note: 'Requires authentication, a database and hosting', default: false },
  stockManagement: { label: 'Stock Management', level: 'backend', note: 'Real-time stock needs a database', default: false },
  orderManagement: { label: 'Order Management', level: 'backend', note: 'Storing and tracking orders needs a database', default: false },
  database: { label: 'Database', level: 'backend', note: 'Managed database service (e.g. Supabase, Firebase, PostgreSQL)', default: false },
  paymentGateway: { label: 'Payment Gateway', level: 'backend', note: 'SSLCommerz / bKash / Stripe need a merchant account and server-side verification', default: false },
}

export const defaultFeatures = (): FeatureSelection =>
  Object.fromEntries(FEATURE_KEYS.map((k) => [k, FEATURE_META[k].default])) as FeatureSelection

export const emptyBrand = (): BrandInfo => ({
  brandName: '', tagline: '', description: '', logoUrl: '', email: '', phone: '', whatsapp: '', address: '', facebook: '', instagram: '', tiktok: '', otherSocial: '',
})

export const emptyDesign = (): BrandDesign => ({
  primaryColor: '#111111', secondaryColor: '#c8a97e', backgroundColor: '#ffffff', typography: 'No preference', styles: [], referenceUrls: '', referenceNotes: '', theme: 'No preference',
})

export const emptyProduct = (): ClientProduct => ({
  id: uid('prod'), name: '', category: '', description: '', regularPrice: '', discountPrice: '', stock: '', imageUrls: [''], sizes: '', colors: '', sku: '', featured: false, newArrival: false,
})

export const emptyOrder = (): OrderDelivery => ({
  whatsappOrderNumber: '', deliveryInsideDhaka: '', deliveryOutsideDhaka: '', freeDeliveryThreshold: '', estimatedDelivery: '', returnPolicy: '', exchangePolicy: '', paymentMethods: ['Cash on Delivery'], cashOnDelivery: true,
})

export const emptyAdditional = (): AdditionalInfo => ({
  designRequirements: '', specialFeatures: '', importantNotes: '', referenceMaterials: '', hostingPreference: '', domainInfo: '',
})

export function emptyProfile(): ClientProfile {
  const now = new Date().toISOString()
  return {
    id: uid('client'),
    schemaVersion: 1,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    brand: emptyBrand(),
    design: emptyDesign(),
    products: [emptyProduct()],
    features: defaultFeatures(),
    order: emptyOrder(),
    additional: emptyAdditional(),
  }
}
