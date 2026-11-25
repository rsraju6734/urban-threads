export type DesignStyle = 'Premium' | 'Luxury' | 'Minimalist' | 'Streetwear' | 'Modern' | 'Casual'
export type ThemePreference = 'Light' | 'Dark' | 'Light & Dark toggle' | 'No preference'

export interface BrandInfo {
  brandName: string
  tagline: string
  description: string
  logoUrl: string
  email: string
  phone: string
  whatsapp: string
  address: string
  facebook: string
  instagram: string
  tiktok: string
  otherSocial: string
}

export interface BrandDesign {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  typography: string
  styles: DesignStyle[]
  referenceUrls: string
  referenceNotes: string
  theme: ThemePreference
}

export interface ClientProduct {
  id: string
  name: string
  category: string
  description: string
  regularPrice: string
  discountPrice: string
  stock: string
  imageUrls: string[]
  sizes: string
  colors: string
  sku: string
  featured: boolean
  newArrival: boolean
}

export const FEATURE_KEYS = [
  'homepage',
  'catalog',
  'productDetails',
  'cart',
  'whatsappOrdering',
  'search',
  'categoryFilter',
  'sizeSelection',
  'colorSelection',
  'reviews',
  'about',
  'contact',
  'faq',
  'deliveryInfo',
  'coupons',
  'adminDashboard',
  'stockManagement',
  'orderManagement',
  'database',
  'paymentGateway',
] as const

export type FeatureKey = (typeof FEATURE_KEYS)[number]
export type FeatureSelection = Record<FeatureKey, boolean>

export interface OrderDelivery {
  whatsappOrderNumber: string
  deliveryInsideDhaka: string
  deliveryOutsideDhaka: string
  freeDeliveryThreshold: string
  estimatedDelivery: string
  returnPolicy: string
  exchangePolicy: string
  paymentMethods: string[]
  cashOnDelivery: boolean
}

export interface AdditionalInfo {
  designRequirements: string
  specialFeatures: string
  importantNotes: string
  referenceMaterials: string
  hostingPreference: string
  domainInfo: string
}

export type ProfileStatus = 'draft' | 'complete'

export interface ClientProfile {
  id: string
  schemaVersion: 1
  status: ProfileStatus
  createdAt: string
  updatedAt: string
  brand: BrandInfo
  design: BrandDesign
  products: ClientProduct[]
  features: FeatureSelection
  order: OrderDelivery
  additional: AdditionalInfo
}
