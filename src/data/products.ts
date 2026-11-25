import type { Product, ProductColor } from '../types/store'
import { photo, type PhotoKey } from './images'

const C = {
  black: { name: 'Black', hex: '#111111' },
  white: { name: 'White', hex: '#f6f4ef' },
  ivory: { name: 'Ivory', hex: '#efe8da' },
  beige: { name: 'Beige', hex: '#d6c3a5' },
  grey: { name: 'Heather Grey', hex: '#9b9b9b' },
  navy: { name: 'Navy', hex: '#1f2a44' },
  olive: { name: 'Olive', hex: '#5b5e3c' },
  sky: { name: 'Sky Blue', hex: '#a9c3dd' },
  indigo: { name: 'Indigo', hex: '#2c3b5a' },
  rust: { name: 'Rust', hex: '#a4552f' },
  khaki: { name: 'Khaki', hex: '#b49e7a' },
  green: { name: 'Emerald', hex: '#2f8f6b' },
  coral: { name: 'Coral', hex: '#ef7b63' },
} satisfies Record<string, ProductColor>

const TOPS = ['S', 'M', 'L', 'XL', 'XXL']
const BOTTOMS = ['28', '30', '32', '34', '36']
const pics = (...keys: PhotoKey[]) => keys.map((k) => photo(k, 1000, 1250))

export const products: Product[] = [
  {
    id: 'ut-001', slug: 'signature-black-tee', name: 'Signature Black Tee', category: 'tshirts',
    description: 'Our best-selling everyday tee in 240 GSM combed cotton. A relaxed shoulder, a structured neckline that keeps its shape and a garment-washed finish that feels broken-in from day one.',
    details: ['240 GSM combed cotton', 'Relaxed fit, dropped shoulder', 'Rib-knit crew neck', 'Machine wash cold, dry flat'],
    price: 1290, salePrice: 990, images: pics('teeBlackModel', 'teeBlackPrint', 'teeBlackHanger'),
    sizes: TOPS, colors: [C.black, C.white], stock: 42, isNew: true, isBestSeller: true, isFeatured: true,
  },
  {
    id: 'ut-002', slug: 'essential-heavyweight-tee', name: 'Essential Heavyweight Tee', category: 'tshirts',
    description: 'A clean white staple with a premium hand-feel. Pre-shrunk and cut slightly longer in the body for a contemporary silhouette.',
    details: ['220 GSM ring-spun cotton', 'Regular fit', 'Pre-shrunk', 'Made in Bangladesh'],
    price: 1090, images: pics('teeWhiteModel', 'teeWhiteFlat', 'teeWhiteDark'),
    sizes: TOPS, colors: [C.white, C.ivory, C.black], stock: 60, isNew: true, isBestSeller: true,
  },
  {
    id: 'ut-003', slug: 'original-graphic-tee', name: 'Original Graphic Tee', category: 'tshirts',
    description: 'Bold front graphic printed with soft-hand water-based inks on an ivory base. Statement streetwear that stays comfortable all day.',
    details: ['100% cotton jersey', 'Water-based screen print', 'Boxy fit', 'Turn inside out to wash'],
    price: 1390, salePrice: 1150, images: pics('teeGraphic', 'teeGraphicModel'),
    sizes: TOPS, colors: [C.ivory], stock: 18, isNew: true,
  },
  {
    id: 'ut-004', slug: 'oversized-street-tee', name: 'Oversized Street Tee', category: 'tshirts',
    description: 'An oversized silhouette with a wide sleeve and dropped shoulder. Designed to layer under open shirts and jackets.',
    details: ['260 GSM cotton', 'Oversized fit — size down for regular', 'Double-needle hems'],
    price: 1490, images: pics('teeBlackModel2', 'teeWhiteDark', 'teeBlueHanger'),
    sizes: TOPS, colors: [C.black, C.white, C.sky], stock: 25, isBestSeller: true,
  },
  {
    id: 'ut-005', slug: 'cloud-pullover-hoodie', name: 'Cloud Pullover Hoodie', category: 'hoodies',
    description: 'Brushed-back fleece with a double-layer hood and kangaroo pocket. Soft, warm and built to keep its shape wash after wash.',
    details: ['380 GSM brushed fleece', 'Double-layer hood', 'Ribbed cuffs and hem', 'Kangaroo pocket'],
    price: 2690, salePrice: 2290, images: pics('hoodieWhiteModel', 'hoodieGrey'),
    sizes: TOPS, colors: [C.white, C.grey], stock: 20, isNew: true, isFeatured: true, isBestSeller: true,
  },
  {
    id: 'ut-006', slug: 'classic-crew-sweatshirt', name: 'Classic Crew Sweatshirt', category: 'hoodies',
    description: 'A minimal crewneck sweatshirt with a clean front and refined ribbing — the polished alternative to a hoodie.',
    details: ['330 GSM loopback cotton', 'Regular fit', 'Ribbed neckline, cuffs and hem'],
    price: 2190, images: pics('sweatWhite', 'rackLight'),
    sizes: TOPS, colors: [C.white, C.beige], stock: 30, isNew: true,
  },
  {
    id: 'ut-007', slug: 'oxford-button-down-shirt', name: 'Oxford Button-Down Shirt', category: 'shirts',
    description: 'Classic oxford cloth with a soft-roll button-down collar. Dress it up with chinos or wear it open over a tee.',
    details: ['100% cotton oxford', 'Button-down collar', 'Tailored fit', 'Mother-of-pearl effect buttons'],
    price: 2390, images: pics('shirtWhiteModel', 'shirtsHanging', 'shirtWhiteTie'),
    sizes: TOPS, colors: [C.white, C.sky], stock: 24, isFeatured: true,
  },
  {
    id: 'ut-008', slug: 'chambray-denim-shirt', name: 'Chambray Denim Shirt', category: 'shirts',
    description: 'Lightweight chambray with two chest pockets and a washed indigo tone. The year-round workhorse shirt.',
    details: ['Lightweight cotton chambray', 'Two flap chest pockets', 'Regular fit'],
    price: 2490, salePrice: 1990, images: pics('shirtDenim', 'shirtsFolded'),
    sizes: TOPS, colors: [C.sky, C.indigo], stock: 14,
  },
  {
    id: 'ut-009', slug: 'tailored-poplin-shirt', name: 'Tailored Poplin Shirt', category: 'shirts',
    description: 'Crisp, smooth poplin cut close to the body. A sharp choice for office days and evening plans.',
    details: ['Cotton poplin', 'Slim fit', 'Spread collar', 'Easy iron'],
    price: 2290, images: pics('shirtBlueModel', 'shirtsFolded', 'shirtsHanging'),
    sizes: TOPS, colors: [C.sky, C.white], stock: 19, isNew: true,
  },
  {
    id: 'ut-010', slug: 'pique-cotton-polo', name: 'Piqué Cotton Polo', category: 'polos',
    description: 'A heritage piqué polo with a two-button placket and ribbed collar, available in a curated seasonal palette.',
    details: ['Cotton piqué', 'Two-button placket', 'Ribbed collar and cuffs', 'Side vents'],
    price: 1790, salePrice: 1490, images: pics('polosFolded', 'teesRack'),
    sizes: TOPS, colors: [C.green, C.coral, C.navy], stock: 36, isBestSeller: true, isFeatured: true,
  },
  {
    id: 'ut-011', slug: 'slim-raw-denim', name: 'Slim Raw Denim', category: 'pants',
    description: 'Rigid 13.5oz denim in a slim, tapered cut that fades beautifully to your wear. Finished with copper rivets.',
    details: ['13.5oz cotton denim', 'Slim tapered fit', 'Copper rivets', 'Five-pocket styling'],
    price: 3290, images: pics('jeansStreet', 'jeansFolded', 'jeansHanging'),
    sizes: BOTTOMS, colors: [C.indigo, C.black], stock: 22, isBestSeller: true, isFeatured: true,
  },
  {
    id: 'ut-012', slug: 'tapered-stretch-chino', name: 'Tapered Stretch Chino', category: 'pants',
    description: 'Smart enough for the office, easy enough for the weekend. A touch of stretch for all-day comfort.',
    details: ['98% cotton, 2% elastane', 'Tapered leg', 'Slant front pockets'],
    price: 2490, salePrice: 2090, images: pics('chinoStreet', 'streetDenim'),
    sizes: BOTTOMS, colors: [C.khaki, C.navy, C.olive], stock: 28, isNew: true,
  },
  {
    id: 'ut-013', slug: 'washed-denim-jacket', name: 'Washed Denim Jacket', category: 'jackets',
    description: 'The trucker jacket, refined. Vintage light wash, a boxy body and tonal stitching for an elevated finish.',
    details: ['12oz cotton denim', 'Boxy fit', 'Button-flap chest pockets', 'Adjustable waist tabs'],
    price: 3990, salePrice: 3490, images: pics('denimJacketModel', 'denimJacketFlat', 'denimJacketDark'),
    sizes: TOPS, colors: [C.sky, C.indigo], stock: 12, isNew: true, isFeatured: true, isBestSeller: true,
  },
  {
    id: 'ut-014', slug: 'leather-biker-jacket', name: 'Leather Biker Jacket', category: 'jackets',
    description: 'A modern biker in supple vegan leather with an asymmetric zip, quilted lining and gunmetal hardware.',
    details: ['Premium vegan leather', 'Asymmetric zip', 'Quilted lining', 'Zip cuffs'],
    price: 6490, images: pics('jacketBlackModel', 'jacketLeather'),
    sizes: TOPS, colors: [C.black], stock: 8, isFeatured: true,
  },
  {
    id: 'ut-015', slug: 'field-utility-jacket', name: 'Field Utility Jacket', category: 'jackets',
    description: 'A four-pocket utility jacket in durable cotton twill with a stand collar and concealed hood.',
    details: ['Cotton twill', 'Four utility pockets', 'Concealed hood', 'Drawcord waist'],
    price: 4590, salePrice: 3890, images: pics('jacketUtility'),
    sizes: TOPS, colors: [C.olive], stock: 10,
  },
  {
    id: 'ut-016', slug: 'rust-bomber-jacket', name: 'Rust Bomber Jacket', category: 'jackets',
    description: 'A lightweight bomber in a warm rust tone with ribbed trims — the transitional layer for cooler evenings.',
    details: ['Nylon shell', 'Ribbed collar, cuffs and hem', 'Utility sleeve pocket'],
    price: 3790, images: pics('jacketBomber'),
    sizes: TOPS, colors: [C.rust, C.black], stock: 15, isNew: true,
  },
  {
    id: 'ut-017', slug: 'double-breasted-blazer', name: 'Double-Breasted Blazer', category: 'jackets',
    description: 'Sharp tailoring with peak lapels and a soft shoulder. A statement piece for occasions that matter.',
    details: ['Wool-blend suiting', 'Peak lapels', 'Half-lined', 'Dry clean only'],
    price: 7490, salePrice: 6490, images: pics('blazerBlackModel', 'blazerCamel'),
    sizes: ['S', 'M', 'L', 'XL'], colors: [C.black, C.beige], stock: 6, isFeatured: true,
  },
]

export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug)
export const effectivePrice = (p: Product) => p.salePrice ?? p.price
export const discountPercent = (p: Product) => (p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0)
export const priceBounds = {
  min: Math.min(...products.map(effectivePrice)),
  max: Math.max(...products.map(effectivePrice)),
}
