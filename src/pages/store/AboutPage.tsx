import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Compass, Eye, Gem, Leaf, Scissors } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { EASE, fadeUpChild, ImageReveal, Reveal, Separator, SplitWords, Stagger } from '../../components/ui/Reveal'
import { editorial } from '../../data/content'

export default function AboutPage() {
  const hero = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  return (
    <>
      <section ref={hero} className="relative flex h-[70vh] min-h-[460px] items-end overflow-hidden bg-ink text-white">
        <motion.img style={{ y }} src={editorial.about1} alt="Inside the URBAN THREADS studio" className="absolute inset-0 h-full w-full object-cover opacity-55" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="container-x relative pb-14 sm:pb-20">
          <h1 className="max-w-4xl text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
            <SplitWords text="Clothing with" inView={false} delay={0.35} className="block" />
            <SplitWords text="quiet confidence." inView={false} delay={0.55} className="block font-serif font-medium italic" />
          </h1>
        </div>
      </section>

      <section className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl"><SplitWords text="Born in Dhaka. Made for everywhere." /></h2>
        </div>
        <Reveal delay={0.15} className="space-y-5 text-lg leading-relaxed text-neutral-600">
          <p>
            URBAN THREADS started in a small Dhaka studio with a frustration: premium-feeling everyday clothing was either imported at unreachable prices or made without
            care for fit and fabric. We set out to change that.
          </p>
          <p>
            Every piece begins with fabric. We source heavyweight cottons, honest denim and soft fleece, then refine patterns until the shoulder sits right and the
            silhouette feels modern without chasing trends. The result is a wardrobe of considered essentials designed to be worn for years.
          </p>
          <p>We deliver anywhere in Bangladesh, with the same personal service on every order, over WhatsApp.</p>
        </Reveal>
      </section>

      <section className="container-x grid gap-4 pb-20 sm:grid-cols-2 sm:gap-6 sm:pb-28">
        <ImageReveal moment className="aspect-[4/5] rounded-2xl"><img src={editorial.about2} alt="Tailored blazer styled casually" loading="lazy" className="h-full w-full object-cover" /></ImageReveal>
        <ImageReveal className="aspect-[4/5] rounded-2xl sm:mt-24"><img src={editorial.about3} alt="Curated rail of neutral garments" loading="lazy" className="h-full w-full object-cover" /></ImageReveal>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          {[
            { Icon: Compass, label: 'Mission', title: 'Elevate the everyday.', text: 'To make premium, thoughtfully designed clothing accessible to every young professional and creative in Bangladesh — with honest pricing and personal service.' },
            { Icon: Eye, label: 'Vision', title: 'A Bangladeshi brand the world wears.', text: 'To build an internationally respected fashion label from Dhaka, proving that world-class design and craftsmanship can start right here.' },
          ].map(({ Icon, label, title, text }, i) => (
            <Reveal key={label} delay={i * 0.15} className="rounded-2xl p-8 ring-1 ring-white/10 sm:p-10">
              <Icon className="h-8 w-8 text-sand" aria-hidden />
              <p className="mt-6 text-sm font-semibold text-sand">{label}</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
              <p className="mt-4 leading-relaxed text-white/70">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl"><SplitWords text="Our values" /></h2>
        </div>
        <Separator className="mt-12 text-ink" />
        <Stagger className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
            { Icon: Gem, title: 'Quality first', text: 'Heavier fabrics, cleaner seams, better hardware — the details that make clothes last.' },
            { Icon: Scissors, title: 'Considered design', text: 'Timeless silhouettes refined season after season, not disposable trends.' },
            { Icon: Leaf, title: 'Responsible making', text: 'Small production runs with trusted local partners to reduce waste.' },
          ].map(({ Icon, title, text }) => (
            <motion.div key={title} variants={fadeUpChild} className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ivory"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
            </motion.div>
          ))}
        </Stagger>
        <Reveal className="mt-16 text-center">
          <Link to="/shop" className="group inline-flex items-center gap-3 rounded-md bg-ink px-8 py-4 text-sm font-semibold text-white transition hover:bg-ink-3">
            Shop the Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  )
}
