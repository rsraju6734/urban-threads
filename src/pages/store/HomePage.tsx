import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, MessageCircle, PackageCheck, RefreshCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroSlider } from '../../components/store/HeroSlider'
import { ProductCard } from '../../components/store/ProductCard'
import { SectionHeading } from '../../components/store/Extras'
import { WhatsappIcon } from '../../components/ui/BrandIcons'
import { ImageReveal } from '../../components/ui/Reveal'
import { useToast } from '../../context/ToastContext'
import { categories } from '../../data/categories'
import { editorial } from '../../data/content'
import { photo } from '../../data/images'
import type { Product } from '../../types/store'
import { useCatalog } from '../../context/CatalogContext'
import { storeConfig } from '../../data/storeConfig'
import { formatBDT } from '../../utils/format'

/*
 * Home page plan (taste-skill): the hero enters once on load; two dealt moments —
 * (1) the sale banner's photograph drifts inside its own frame, (2) the brand-story photograph is revealed.
 * Everything else is static on scroll and answers the pointer instead.
 */

function ViewAll({ to, label = 'View All Products' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
      <span className="link-underline">{label}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-[var(--ease-luxe)] group-hover:translate-x-1" />
    </Link>
  )
}

function CategoryStrip() {
  return (
    <section aria-label="Shop by category" className="container-x py-8 sm:py-10">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((c) => (
          <li key={c.id}>
            <Link to={`/shop?category=${c.id}`} className="group relative block aspect-[4/3.4] overflow-hidden rounded-xl bg-ink">
              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-[scale,opacity] duration-500 ease-[var(--ease-luxe)] group-hover:scale-[1.03] group-hover:opacity-100"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 text-white sm:bottom-4 sm:left-4">
                <span className="block text-[13px] leading-tight font-semibold sm:text-sm">{c.label[0]}</span>
                <span className="flex items-center gap-1.5 text-[13px] leading-tight font-semibold sm:text-sm">
                  {c.label[1]}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TrustBar() {
  const items = [
    { Icon: Truck, title: 'Free Delivery', text: `On orders over ${formatBDT(storeConfig.delivery.freeThreshold)}` },
    { Icon: ShieldCheck, title: 'Cash on Delivery', text: 'Pay when it arrives' },
    { Icon: RefreshCcw, title: '7-Day Exchange', text: 'Easy size exchanges' },
    { Icon: WhatsappIcon, title: 'WhatsApp Support', text: 'Order and ask in one chat' },
  ]
  return (
    <section aria-label="Store benefits" className="border-y border-black/8 bg-ivory">
      <ul className="container-x grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-black/8">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-neutral-600">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProductGrid({ title, sub, list, to, cols = 'lg:grid-cols-5' }: { title: string; sub: string; list: Product[]; to: string; cols?: string }) {
  return (
    <section className="container-x py-16 sm:py-20">
      <SectionHeading title={title} sub={sub} action={<ViewAll to={to} />} />
      <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 ${cols}`}>
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
      </div>
    </section>
  )
}

function FeaturedCollections() {
  const tiles = [
    { title: 'The Outerwear Edit', text: 'Leather, denim and utility layers.', cta: 'Shop Outerwear', to: '/shop?category=jackets', image: photo('jacketBlackModel', 1200, 1500), big: true },
    { title: 'Everyday Essentials', text: 'Heavyweight tees and fleece.', cta: 'Shop Essentials', to: '/shop?category=tshirts', image: photo('teeGraphicModel', 1000, 700) },
    { title: 'Smart Shirting', text: 'Oxford, poplin and chambray.', cta: 'Shop Shirts', to: '/shop?category=shirts', image: photo('shirtBlueModel', 1000, 700) },
  ]
  return (
    <section className="bg-ivory py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading title="Featured Collections" sub="Edits styled by our team for every part of your week." />
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {tiles.map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className={`group relative block overflow-hidden rounded-2xl bg-ink transition-[translate] duration-200 ease-[var(--ease-luxe)] hover:-translate-y-0.5 ${t.big ? 'aspect-[4/5] lg:row-span-2 lg:aspect-auto lg:h-full' : 'aspect-[16/10]'}`}
            >
              <img src={t.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-[scale] duration-500 ease-[var(--ease-luxe)] group-hover:scale-[1.03]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <span className={`block font-extrabold tracking-tight ${t.big ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{t.title}</span>
                <span className="mt-1 block text-sm text-white/80">{t.text}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="link-underline">{t.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Dealt moment 1: the photograph drifts inside its own frame while the section crosses the screen. Text never moves. */
function PromoBanner() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  return (
    <section ref={ref} className="relative overflow-hidden bg-ink text-white">
      <motion.img style={{ y }} src={editorial.promo} alt="" loading="lazy" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
      <div className="container-x relative py-24 sm:py-32">
        <h2 className="max-w-3xl text-4xl leading-[1.02] font-black tracking-tight text-balance sm:text-6xl">
          <span className="block">Up to 25% off</span>
          <span className="block text-white/70">selected pieces.</span>
        </h2>
        <p className="mt-5 max-w-md text-white/80">Essentials and outerwear at their best price of the season, while stock lasts.</p>
        <Link to="/shop?sale=1" className="press group mt-8 inline-flex min-h-12 items-center gap-3 rounded-md bg-white px-7 py-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-sand">
          Shop the Sale <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

/** Dealt moment 2: the brand photograph is uncovered once as the story comes into view. */
function BrandIntro() {
  return (
    <section className="container-x grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
      <div className="relative">
        <ImageReveal moment className="aspect-[4/5] rounded-2xl">
          <img src={editorial.brand} alt="Model wearing URBAN THREADS streetwear" loading="lazy" className="h-full w-full object-cover" />
        </ImageReveal>
        <div className="absolute -right-2 -bottom-8 hidden w-44 overflow-hidden rounded-xl ring-8 ring-white sm:block lg:-right-10">
          <img src={editorial.brand2} alt="" loading="lazy" className="aspect-[4/5] h-full w-full object-cover" />
        </div>
      </div>
      <div>
        <h2 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
          <span className="block">Designed with intent.</span>
          <span className="block font-serif font-medium italic">Worn with confidence.</span>
        </h2>
        <p className="mt-6 max-w-[60ch] leading-relaxed text-neutral-600">
          URBAN THREADS began with a simple belief: premium clothing shouldn't shout. We care about fabric weight, the fall of a shoulder and the details you only notice
          up close, and we deliver them to your door anywhere in Bangladesh.
        </p>
        <Link to="/about" className="press group mt-10 inline-flex min-h-12 items-center gap-3 rounded-md bg-ink px-7 py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-3">
          Read Our Story <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

/** How ordering works — real process instead of invented testimonials. */
function HowToOrder() {
  const steps = [
    { Icon: ShoppingBag, title: 'Pick your pieces', text: 'Choose size and colour, then add to your cart.' },
    { Icon: MessageCircle, title: 'Send your order on WhatsApp', text: 'We prepare the full order message: items, sizes, total and your address.' },
    { Icon: PackageCheck, title: 'We confirm and deliver', text: `Pay cash on delivery. ${storeConfig.delivery.estimate}.` },
  ]
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <div className="container-x">
        <SectionHeading title="Order in one WhatsApp message" sub="No account and no card details. A real person confirms every order." dark />
        <ol className="grid gap-10 border-t border-white/15 pt-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ Icon, title, text }, i) => (
            <li key={title} className="flex gap-5">
              <span className="text-sm font-semibold text-sand tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <Icon className="h-6 w-6 text-white/80" aria-hidden />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/shop" className="press group mt-12 inline-flex min-h-12 items-center gap-3 rounded-md bg-sand px-7 py-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-white">
          Start Shopping <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { notify } = useToast()
  return (
    <section className="container-x py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ivory">
        <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Get new drops first.</h2>
            <p className="mt-3 max-w-md text-neutral-600">Early access to new collections and private sale invitations.</p>
          </div>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError('Enter an email address like name@example.com.')
                return
              }
              setError('')
              setEmail('')
              notify('info', 'Thanks for your interest', 'This newsletter form is a demo: no email was stored or sent.')
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input
                id="nl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-invalid={!!error}
                aria-describedby={error ? 'nl-email-e' : undefined}
                className={`min-h-12 min-w-0 flex-1 rounded-md border bg-white px-5 py-3.5 text-sm focus:border-ink focus:outline-none ${error ? 'border-red-600' : 'border-black/15'}`}
              />
              <button className="min-h-12 rounded-md bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-3">Subscribe</button>
            </div>
            {error && <p id="nl-email-e" className="mt-2 text-sm text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { products } = useCatalog()
  const newArrivals = products.filter((p) => p.isNew).slice(0, 5)
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4)
  return (
    <>
      <HeroSlider />
      <CategoryStrip />
      <ProductGrid title="New Arrivals" sub="Be the first to wear the latest styles." list={newArrivals} to="/shop?sort=new" />
      <TrustBar />
      <FeaturedCollections />
      <ProductGrid title="Best Sellers" sub="The pieces customers order again." list={bestSellers} to="/shop" cols="lg:grid-cols-4" />
      <PromoBanner />
      <BrandIntro />
      <HowToOrder />
      <Newsletter />
    </>
  )
}
