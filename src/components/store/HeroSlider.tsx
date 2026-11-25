import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroSlides } from '../../data/content'
import { EASE, EASE_IN_OUT } from '../ui/Reveal'

const AUTOPLAY_MS = 7000

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const reduce = useReducedMotion()
  // user-controlled pause (a visible button) + temporary pause while hovering/focusing the hero
  const [stopped, setStopped] = useState(!!reduce)
  const [hovering, setHovering] = useState(false)
  const paused = stopped || hovering

  const go = useCallback((delta: number) => {
    setDir(delta)
    setIndex((i) => (i + delta + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => go(1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [index, paused, go])

  // preload the other slides so transitions never flash
  useEffect(() => {
    heroSlides.forEach((s) => {
      const im = new Image()
      im.src = s.image
    })
  }, [])

  const slide = heroSlides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative -mt-[68px] h-[100svh] max-h-[860px] min-h-[600px] overflow-hidden bg-ink text-white lg:-mt-[76px]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="absolute inset-0">
        <AnimatePresence initial={true} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            className="absolute inset-0"
            initial={{ clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={{ opacity: 0.4, transition: { duration: 1, ease: EASE } }}
            transition={{ duration: 1.1, ease: EASE_IN_OUT }}
          >
            <motion.img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover object-[70%_20%]"
              initial={{ scale: 1.18 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 8, ease: 'linear' }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="relative z-10 h-full">
        <div className="container-x flex h-full flex-col justify-center pt-20">
          <AnimatePresence mode="wait">
            <motion.div key={index} className="max-w-2xl" initial="hidden" animate="show" exit="exit">
              <motion.p
                className="eyebrow mb-5 flex items-center gap-3 text-white/85"
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.15, ease: EASE } }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
              >
                <span className="h-px w-8 bg-sand" /> {slide.eyebrow}
              </motion.p>
              <h1 className="text-[11.5vw] leading-[0.92] font-black tracking-[-0.02em] sm:text-7xl lg:text-[88px]" aria-label={`${slide.lines.join(' ')} ${slide.accent}`}>
                {[...slide.lines.slice(0, -1), `${slide.lines[slide.lines.length - 1]} ${slide.accent}`].map((line, li) => (
                  <span key={li} className="block" aria-hidden>
                    {line.split(' ').map((word, wi) => {
                      const isAccent = li === slide.lines.length - 1 && word === slide.accent
                      return (
                        <span key={wi} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                          <motion.span
                            className={`inline-block ${isAccent ? 'text-sand' : ''}`}
                            variants={{
                              hidden: { y: '105%' },
                              show: { y: '0%', transition: { duration: 0.9, delay: 0.25 + li * 0.1 + wi * 0.05, ease: EASE } },
                              exit: { y: '-105%', transition: { duration: 0.35, ease: EASE_IN_OUT } },
                            }}
                          >
                            {word}
                            {' '}
                          </motion.span>
                        </span>
                      )
                    })}
                  </span>
                ))}
              </h1>
              <motion.p
                className="mt-6 max-w-md text-lg text-white/85 sm:text-xl"
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.65, ease: EASE } }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
              >
                {slide.sub}
              </motion.p>
              <motion.div
                className="mt-9"
                variants={{ hidden: { opacity: 0, y: 12, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, delay: 0.8, ease: EASE } }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
              >
                <Link
                  to={slide.cta.to}
                  className="press group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-md bg-sand px-7 py-4 text-sm font-semibold text-ink"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:scale-x-100" />
                  <span className="relative">{slide.cta.label}</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-20">
        <div className="container-x flex items-center gap-4">
          <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/40 transition-colors hover:bg-white hover:text-ink" aria-label="Previous slide">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">
            {index + 1} / {heroSlides.length}
          </span>
          <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/40 transition-colors hover:bg-white hover:text-ink" aria-label="Next slide">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setStopped((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/40 transition-colors hover:bg-white hover:text-ink"
            aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={stopped}
          >
            {stopped ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <div className="ml-2 hidden h-px w-40 overflow-hidden bg-white/25 sm:block" aria-hidden>
            <motion.div
              key={`${index}-${paused}`}
              className="h-full origin-left bg-sand"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: paused ? 0 : 1 }}
              transition={{ duration: paused ? 0.2 : AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
