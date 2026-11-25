import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal, SplitWords } from '../../components/ui/Reveal'

export default function NotFoundPage({ message = "The page you're looking for doesn't exist or has moved." }: { message?: string }) {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-[120px] leading-none font-black tracking-[-0.04em] text-cream sm:text-[180px]">404</p>
      <h1 className="-mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        <SplitWords text="Lost in style." inView={false} />
      </h1>
      <Reveal delay={0.2}>
        <p className="mt-3 max-w-md text-neutral-500">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-white">Back to Home</Link>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-6 py-3.5 text-sm font-semibold hover:border-ink">
            Browse the Shop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
