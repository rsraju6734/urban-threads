import { motion } from 'framer-motion'
import { Mail, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import { storeConfig } from '../../data/storeConfig'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import { WhatsappIcon } from '../ui/BrandIcons'
import { fadeUpChild } from '../ui/Reveal'
import { Logo } from './Logo'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="container-x pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <motion.div variants={fadeUpChild}>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              Premium fashion and streetwear essentials, designed in Dhaka for people who let their style speak quietly — and confidently.
            </p>
            <SocialLinks className="mt-6 gap-2" itemClass="grid h-9 w-9 place-items-center rounded-full ring-1 ring-white/15 hover:bg-white hover:text-ink hover:opacity-100" />
          </motion.div>
          <motion.nav variants={fadeUpChild} aria-label="Shop">
            <h3 className="eyebrow text-sand">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.id}`} className="link-underline hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
          <motion.nav variants={fadeUpChild} aria-label="Help">
            <h3 className="eyebrow text-sand">Help</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {[
                ['/about', 'About Us'],
                ['/contact', 'Contact'],
                ['/faq', 'FAQ & Delivery'],
                ['/cart', 'Your Cart'],
                ['/orders', 'Track Your Order'],
                ['/shop?sort=new', 'New Arrivals'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="link-underline hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
          <motion.div variants={fadeUpChild}>
            <h3 className="eyebrow text-sand">Get in touch</h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/70">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{storeConfig.address}</li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><a href={`mailto:${storeConfig.email}`} className="hover:text-white">{storeConfig.email}</a></li>
              <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{storeConfig.hours}</li>
            </ul>
            <a
              href={buildWhatsAppUrl(`Hello ${storeConfig.brandName}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <WhatsappIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </motion.div>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-16 text-center text-[10.5vw] leading-[0.85] font-black whitespace-nowrap tracking-[-0.04em] text-white/[0.05] select-none xl:text-[9.5rem]"
        >
          URBAN THREADS
        </p>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} URBAN THREADS. All rights reserved.</p>
          <p>
            Demo storefront crafted by <Link to="/studio" className="text-white/70 hover:text-sand">Khoka Tech</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
