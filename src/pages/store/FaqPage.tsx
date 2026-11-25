import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { WhatsappIcon } from '../../components/ui/BrandIcons'
import { EASE, fadeUpChild, Reveal, SplitWords, Stagger } from '../../components/ui/Reveal'
import { faqs } from '../../data/content'
import { storeConfig } from '../../data/storeConfig'
import { cn } from '../../utils/format'
import { buildWhatsAppUrl } from '../../utils/whatsapp'

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="container-x grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
      <div>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          <SplitWords text="FAQ & Delivery" inView={false} delay={0.15} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-5 max-w-sm text-neutral-600">Everything you need to know about ordering, delivery and exchanges. Can't find your answer?</p>
          <a href={buildWhatsAppUrl(`Hello ${storeConfig.brandName}! I have a question.`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            <WhatsappIcon className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </Reveal>
      </div>
      <Stagger className="divide-y divide-black/10 border-y border-black/10">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <motion.div key={f.q} variants={fadeUpChild}>
              <h2>
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold">
                  {f.q}
                  <Plus className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-45')} />
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
                    <p className="max-w-2xl pb-6 leading-relaxed text-neutral-600">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </Stagger>
    </section>
  )
}
