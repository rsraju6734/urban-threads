import type { ClientProduct, ClientProfile, DesignStyle, FeatureKey, ThemePreference } from '../../types/studio'
import { FEATURE_KEYS } from '../../types/studio'
import { slugify, uid } from '../format'
import { DESIGN_STYLES, FEATURE_META, THEMES, emptyAdditional, emptyBrand, emptyDesign, emptyOrder, emptyProduct, defaultFeatures } from './defaults'
import { digits, isComplete, splitList, toNumber } from './validation'

export const EXPORT_SCHEMA = 'khoka-tech/clothing-client-profile'
export const EXPORT_VERSION = 1

/** Clean, structured, typed representation of a client — this is what gets exported and handed to Claude. */
export function toExportObject(p: ClientProfile) {
  const orderNumber = digits(p.order.whatsappOrderNumber) || digits(p.brand.whatsapp)
  return {
    schema: EXPORT_SCHEMA,
    schemaVersion: EXPORT_VERSION,
    generator: 'Khoka Tech Client Studio',
    exportedAt: new Date().toISOString(),
    client: {
      id: p.id,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    },
    brand: {
      name: p.brand.brandName.trim(),
      tagline: p.brand.tagline.trim(),
      description: p.brand.description.trim(),
      logoUrl: p.brand.logoUrl.trim(),
      contact: {
        email: p.brand.email.trim(),
        phone: p.brand.phone.trim(),
        whatsapp: digits(p.brand.whatsapp),
        address: p.brand.address.trim(),
      },
      social: {
        facebook: p.brand.facebook.trim(),
        instagram: p.brand.instagram.trim(),
        tiktok: p.brand.tiktok.trim(),
        other: splitList(p.brand.otherSocial),
      },
    },
    design: {
      colors: {
        primary: p.design.primaryColor,
        secondary: p.design.secondaryColor,
        background: p.design.backgroundColor,
      },
      typography: p.design.typography,
      styles: p.design.styles,
      theme: p.design.theme,
      referenceWebsites: splitList(p.design.referenceUrls),
      referenceNotes: p.design.referenceNotes.trim(),
    },
    products: p.products.map((x) => ({
      id: x.id,
      name: x.name.trim(),
      category: x.category.trim(),
      description: x.description.trim(),
      sku: x.sku.trim(),
      currency: 'BDT',
      regularPrice: toNumber(x.regularPrice),
      discountPrice: toNumber(x.discountPrice),
      stock: toNumber(x.stock),
      images: x.imageUrls.map((u) => u.trim()).filter(Boolean),
      sizes: splitList(x.sizes),
      colors: splitList(x.colors),
      featured: x.featured,
      newArrival: x.newArrival,
    })),
    features: {
      requested: FEATURE_KEYS.filter((k) => p.features[k]).map((k) => FEATURE_META[k].label),
      notRequested: FEATURE_KEYS.filter((k) => !p.features[k]).map((k) => FEATURE_META[k].label),
      requiresBackend: FEATURE_KEYS.filter((k) => p.features[k] && FEATURE_META[k].level !== 'static').map((k) => ({
        feature: FEATURE_META[k].label,
        level: FEATURE_META[k].level,
        note: FEATURE_META[k].note ?? '',
      })),
      selection: { ...p.features },
    },
    orderAndDelivery: {
      currency: 'BDT',
      whatsappOrderNumber: orderNumber,
      deliveryChargeInsideDhaka: toNumber(p.order.deliveryInsideDhaka),
      deliveryChargeOutsideDhaka: toNumber(p.order.deliveryOutsideDhaka),
      freeDeliveryThreshold: toNumber(p.order.freeDeliveryThreshold),
      estimatedDeliveryTime: p.order.estimatedDelivery.trim(),
      returnPolicy: p.order.returnPolicy.trim(),
      exchangePolicy: p.order.exchangePolicy.trim(),
      paymentMethods: p.order.paymentMethods,
      cashOnDelivery: p.order.cashOnDelivery,
    },
    additional: {
      specialDesignRequirements: p.additional.designRequirements.trim(),
      specialFeatures: p.additional.specialFeatures.trim(),
      importantNotes: p.additional.importantNotes.trim(),
      clientReferenceMaterials: p.additional.referenceMaterials.trim(),
      hostingPreference: p.additional.hostingPreference.trim(),
      domainInformation: p.additional.domainInfo.trim(),
    },
  }
}

export type ExportObject = ReturnType<typeof toExportObject>

export const exportFileBase = (p: ClientProfile) => `${slugify(p.brand.brandName || 'client')}-${new Date().toISOString().slice(0, 10)}`
export const toExportJson = (p: ClientProfile) => JSON.stringify(toExportObject(p), null, 2)

// ---------- Import ----------

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const bool = (v: unknown, d = false) => (typeof v === 'boolean' ? v : d)
const strArr = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : typeof v === 'string' ? splitList(v) : [])
const pick = (o: unknown, ...path: string[]): unknown => path.reduce<unknown>((acc, k) => (isObj(acc) ? acc[k] : undefined), o)

export class ImportError extends Error {}

function fromExportObject(o: Obj): ClientProfile {
  const brand = pick(o, 'brand')
  if (!isObj(brand)) throw new ImportError('Missing "brand" section.')
  const now = new Date().toISOString()
  const products: ClientProduct[] = (Array.isArray(o.products) ? o.products : []).filter(isObj).map((x) => ({
    ...emptyProduct(),
    id: str(x.id) || uid('prod'),
    name: str(x.name),
    category: str(x.category),
    description: str(x.description),
    sku: str(x.sku),
    regularPrice: str(x.regularPrice),
    discountPrice: str(x.discountPrice),
    stock: str(x.stock),
    imageUrls: strArr(x.images ?? x.imageUrls).length ? strArr(x.images ?? x.imageUrls) : [''],
    sizes: strArr(x.sizes).join(', '),
    colors: strArr(x.colors).join(', '),
    featured: bool(x.featured),
    newArrival: bool(x.newArrival),
  }))
  const sel = pick(o, 'features', 'selection')
  const features = defaultFeatures()
  if (isObj(sel)) FEATURE_KEYS.forEach((k) => (features[k as FeatureKey] = bool(sel[k], features[k as FeatureKey])))
  const styles = strArr(pick(o, 'design', 'styles')).filter((s): s is DesignStyle => (DESIGN_STYLES as string[]).includes(s))
  const theme = str(pick(o, 'design', 'theme'))
  const od = pick(o, 'orderAndDelivery')
  const ad = pick(o, 'additional')
  return {
    id: str(pick(o, 'client', 'id')) || uid('client'),
    schemaVersion: 1,
    status: 'draft',
    createdAt: str(pick(o, 'client', 'createdAt')) || now,
    updatedAt: now,
    brand: {
      ...emptyBrand(),
      brandName: str(brand.name),
      tagline: str(brand.tagline),
      description: str(brand.description),
      logoUrl: str(brand.logoUrl),
      email: str(pick(brand, 'contact', 'email')),
      phone: str(pick(brand, 'contact', 'phone')),
      whatsapp: str(pick(brand, 'contact', 'whatsapp')),
      address: str(pick(brand, 'contact', 'address')),
      facebook: str(pick(brand, 'social', 'facebook')),
      instagram: str(pick(brand, 'social', 'instagram')),
      tiktok: str(pick(brand, 'social', 'tiktok')),
      otherSocial: strArr(pick(brand, 'social', 'other')).join('\n'),
    },
    design: {
      ...emptyDesign(),
      primaryColor: str(pick(o, 'design', 'colors', 'primary')) || '#111111',
      secondaryColor: str(pick(o, 'design', 'colors', 'secondary')) || '#c8a97e',
      backgroundColor: str(pick(o, 'design', 'colors', 'background')) || '#ffffff',
      typography: str(pick(o, 'design', 'typography')) || 'No preference',
      styles,
      theme: ((THEMES as string[]).includes(theme) ? theme : 'No preference') as ThemePreference,
      referenceUrls: strArr(pick(o, 'design', 'referenceWebsites')).join('\n'),
      referenceNotes: str(pick(o, 'design', 'referenceNotes')),
    },
    products: products.length ? products : [emptyProduct()],
    features,
    order: {
      ...emptyOrder(),
      whatsappOrderNumber: str(pick(od, 'whatsappOrderNumber')),
      deliveryInsideDhaka: str(pick(od, 'deliveryChargeInsideDhaka')),
      deliveryOutsideDhaka: str(pick(od, 'deliveryChargeOutsideDhaka')),
      freeDeliveryThreshold: str(pick(od, 'freeDeliveryThreshold')),
      estimatedDelivery: str(pick(od, 'estimatedDeliveryTime')),
      returnPolicy: str(pick(od, 'returnPolicy')),
      exchangePolicy: str(pick(od, 'exchangePolicy')),
      paymentMethods: strArr(pick(od, 'paymentMethods')),
      cashOnDelivery: bool(pick(od, 'cashOnDelivery'), true),
    },
    additional: {
      ...emptyAdditional(),
      designRequirements: str(pick(ad, 'specialDesignRequirements')),
      specialFeatures: str(pick(ad, 'specialFeatures')),
      importantNotes: str(pick(ad, 'importantNotes')),
      referenceMaterials: str(pick(ad, 'clientReferenceMaterials')),
      hostingPreference: str(pick(ad, 'hostingPreference')),
      domainInfo: str(pick(ad, 'domainInformation')),
    },
  }
}

/** Accepts the Studio export format (or a list of them / a raw backup) and returns normalised profiles. */
export function parseImport(text: string): ClientProfile[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new ImportError('This file is not valid JSON.')
  }
  const list = Array.isArray(data) ? data : isObj(data) && Array.isArray(data.profiles) ? data.profiles : [data]
  if (!list.length) throw new ImportError('The file does not contain any client profiles.')
  return list.map((item, i) => {
    if (!isObj(item)) throw new ImportError(`Item ${i + 1} is not a client profile object.`)
    let profile: ClientProfile
    if (item.schema === EXPORT_SCHEMA || (isObj(item.brand) && 'name' in item.brand)) {
      profile = fromExportObject(item)
    } else if (isObj(item.brand) && 'brandName' in item.brand) {
      // raw internal format (backup)
      const raw = item as Obj
      const merged: ClientProfile = {
        id: str(raw.id) || uid('client'),
        schemaVersion: 1,
        status: 'draft',
        createdAt: str(raw.createdAt) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        brand: { ...emptyBrand(), ...(raw.brand as Obj) } as ClientProfile['brand'],
        design: { ...emptyDesign(), ...(isObj(raw.design) ? raw.design : {}) } as ClientProfile['design'],
        products: (Array.isArray(raw.products) ? raw.products : []).filter(isObj).map((x) => ({ ...emptyProduct(), ...x }) as ClientProduct),
        features: { ...defaultFeatures(), ...(isObj(raw.features) ? raw.features : {}) } as ClientProfile['features'],
        order: { ...emptyOrder(), ...(isObj(raw.order) ? raw.order : {}) } as ClientProfile['order'],
        additional: { ...emptyAdditional(), ...(isObj(raw.additional) ? raw.additional : {}) } as ClientProfile['additional'],
      }
      profile = fromExportObject(toExportObject(merged) as unknown as Obj)
    } else {
      throw new ImportError(`Item ${i + 1} is not a Khoka Tech client profile (missing brand information).`)
    }
    profile.status = isComplete(profile) ? 'complete' : 'draft'
    return profile
  })
}
