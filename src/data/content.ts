import { photo } from './images'

export interface HeroSlide {
  eyebrow: string
  lines: string[]
  accent: string
  sub: string
  image: string
  cta: { label: string; to: string }
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'New Collection',
    lines: ['STYLE THAT', 'DEFINES'],
    accent: 'YOU.',
    sub: 'Premium Fashion. Timeless Style.',
    image: photo('teeBlackModel', 2000),
    cta: { label: 'Shop Now', to: '/shop' },
  },
  {
    eyebrow: 'Outerwear Edit',
    lines: ['LAYERS WITH', 'QUIET'],
    accent: 'POWER.',
    sub: 'Leather, denim and utility jackets for the season ahead.',
    image: photo('jacketBlackModel', 2000),
    cta: { label: 'Shop Jackets', to: '/shop?category=jackets' },
  },
  {
    eyebrow: 'Streetwear Essentials',
    lines: ['MADE FOR', 'THE'],
    accent: 'CITY.',
    sub: 'Heavyweight cotton, relaxed fits and everyday staples.',
    image: photo('streetSitting', 2000),
    cta: { label: 'Explore Essentials', to: '/shop?category=tshirts' },
  },
]

export const faqs = [
  { q: 'How do I place an order?', a: 'Add products to your cart, open the cart and choose "Order via WhatsApp". Fill in your name, phone and address — we generate a complete order message and open WhatsApp so you can send it to us. Our team confirms availability and delivery in the chat.' },
  { q: 'What are the delivery charges?', a: 'Delivery inside Dhaka is ৳70 and outside Dhaka is ৳130. Orders of ৳2000 or more qualify for free delivery anywhere in Bangladesh.' },
  { q: 'How long does delivery take?', a: 'Inside Dhaka usually takes 1–2 working days. Outside Dhaka takes 3–5 working days.' },
  { q: 'Which payment methods do you accept?', a: 'Cash on Delivery is available nationwide. Mobile banking details are shared in the WhatsApp chat when we confirm your order. We never ask for card details on this website.' },
  { q: 'Can I exchange a size?', a: 'Yes. Unworn items with original tags can be exchanged within 7 days of delivery. Contact us on WhatsApp with your order details.' },
  { q: 'How do I choose the right size?', a: 'Our tops follow standard sizing. Oversized styles are noted in the product details — size down for a regular fit. Message us for exact garment measurements.' },
]

export const editorial = {
  promo: photo('storeRack', 1800, 900),
  brand: photo('editorialArch', 1000, 1250),
  brand2: photo('portraitKnit', 800, 1000),
  about1: photo('storeInterior', 2000, 1100),
  about2: photo('blazerCamel', 900, 1100),
  about3: photo('rackLight', 900, 1100),
  contact: photo('streetDenim', 1200, 1400),
  newsletter: photo('teesRack', 1600, 800),
}
