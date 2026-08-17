import { MapPin } from 'lucide-react'
import Reveal from './ui/Reveal'

export default function FinalCTA() {
  return (
    <section className="bg-lightgreen py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <Reveal>
          <div className="bg-white rounded-[32px] px-8 py-14 md:px-16 md:py-20 text-center shadow-card relative overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full border-[18px] border-yellow/25" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-14 -right-14 w-48 h-48 rounded-full border-[18px] border-green/15" aria-hidden="true" />

            <h2 className="relative font-display font-extrabold text-navy text-3xl md:text-[44px] leading-tight max-w-2xl mx-auto">
              Ready to Put Protein Before Anything Else?
            </h2>
            <p className="relative mt-4 font-display font-bold text-green text-lg">
              Fresh food. Better protein. Every day.
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#menu"
                className="bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:bg-yellow-deep hover:-translate-y-0.5 transition-all shadow-[0_10px_24px_-8px_rgba(242,194,26,0.7)]"
              >
                Order Now
              </a>
              <a
                href="#truck"
                className="inline-flex items-center gap-2 border-2 border-navy text-navy font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:bg-navy hover:text-white transition-colors"
              >
                <MapPin size={16} /> Find Our Truck
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
