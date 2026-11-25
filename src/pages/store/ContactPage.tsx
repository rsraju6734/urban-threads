import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, Mail, MapPin, Truck } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '../../components/ui/BrandIcons'
import { fadeUpChild, ImageReveal, Reveal, SplitWords, Stagger } from '../../components/ui/Reveal'
import { editorial } from '../../data/content'
import { storeConfig } from '../../data/storeConfig'
import { formatBDT } from '../../utils/format'
import { buildWhatsAppUrl } from '../../utils/whatsapp'

export default function ContactPage() {
  const channels = [
    { Icon: WhatsappIcon, title: 'WhatsApp', text: storeConfig.whatsappNumber ? `+${storeConfig.whatsappNumber}` : 'Chat with our team', href: buildWhatsAppUrl(`Hello ${storeConfig.brandName}! I'd like some help.`), accent: 'bg-[#25D366] text-white' },
    { Icon: FacebookIcon, title: 'Facebook', text: 'Message our page', href: storeConfig.social.facebook, accent: 'bg-[#1877F2] text-white' },
    { Icon: InstagramIcon, title: 'Instagram', text: 'Follow new drops', href: storeConfig.social.instagram, accent: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white' },
    { Icon: TiktokIcon, title: 'TikTok', text: 'Styling videos', href: storeConfig.social.tiktok, accent: 'bg-ink text-white' },
  ]
  return (
    <>
      <section className="container-x grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <h1 className="text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
            <SplitWords text="Let's talk" inView={false} delay={0.2} className="block" />
            <SplitWords text="style." inView={false} delay={0.35} className="block font-serif font-medium italic" />
          </h1>
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-md text-lg text-neutral-600">Questions about sizing, an order or a product? The fastest way to reach us is WhatsApp — real people reply within minutes during store hours.</p>
          </Reveal>

          <Stagger className="mt-10 grid gap-3 sm:grid-cols-2">
            {channels.map(({ Icon, title, text, href, accent }) => (
              <motion.a key={title} variants={fadeUpChild} href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl p-4 ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-black/20">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${accent}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="block truncate text-sm text-neutral-500">{text}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
              </motion.a>
            ))}
          </Stagger>

          <Stagger className="mt-10 space-y-5 border-t border-black/8 pt-8 text-sm">
            {[
              { Icon: MapPin, label: 'Studio', value: storeConfig.address },
              { Icon: Mail, label: 'Email', value: storeConfig.email, href: `mailto:${storeConfig.email}` },
              { Icon: Clock, label: 'Hours', value: storeConfig.hours },
              { Icon: Truck, label: 'Delivery', value: `${storeConfig.delivery.estimate}. Inside Dhaka ${formatBDT(storeConfig.delivery.insideDhaka)} · Outside ${formatBDT(storeConfig.delivery.outsideDhaka)}` },
            ].map(({ Icon, label, value, href }) => (
              <motion.div key={label} variants={fadeUpChild} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sand-dark" aria-hidden />
                <div>
                  <p className="font-semibold">{label}</p>
                  {href ? <a href={href} className="text-neutral-600 hover:text-ink">{value}</a> : <p className="text-neutral-600">{value}</p>}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
        <div className="relative">
          <ImageReveal className="aspect-[4/5] rounded-2xl lg:sticky lg:top-28">
            <img src={editorial.contact} alt="URBAN THREADS street style" className="h-full w-full object-cover" />
          </ImageReveal>
        </div>
      </section>
    </>
  )
}
