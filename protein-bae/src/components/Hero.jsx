import { ArrowRight } from 'lucide-react'
import Reveal from './ui/Reveal'
import saladBowlImg from '../assets/images/protein-salad-bowl.jpg'
import wrapImg from '../assets/images/protein-wrap.jpg'
import shakeImg from '../assets/images/protein-shake.jpg'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-[120px] pb-20 md:pt-[150px] md:pb-28">
      {/* decorative ring + leaf accents, echoing the logo */}
      <div className="pointer-events-none absolute -top-16 -right-24 w-[420px] h-[420px] rounded-full border-[26px] border-yellow/25" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-10 left-[-90px] w-64 h-64 rounded-full bg-lightgreen" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 bg-lightgreen text-green font-bold text-xs tracking-[0.14em] uppercase px-4 py-2 rounded-full">
            Fresh &bull; Protein &bull; Every Day
          </span>

          <h1 className="font-display font-extrabold text-navy text-[13vw] leading-[0.98] mt-6 sm:text-6xl md:text-[64px] lg:text-[68px]">
            Fresh Food.
            <br />
            Better Protein.
            <br />
            Every Day.
          </h1>

          <p className="mt-5 font-display font-bold text-2xl text-green">
            Protein Before Anything Else.
          </p>

          <p className="mt-5 text-ink/70 text-lg max-w-md leading-relaxed">
            Delicious, protein-focused meals made for everyday eating — fresh,
            convenient and actually tasty.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#menu"
              className="group inline-flex items-center gap-2 bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide px-7 py-4 rounded-full shadow-[0_10px_24px_-8px_rgba(242,194,26,0.7)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(242,194,26,0.8)] transition-all"
            >
              Order Now
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#menu-grid"
              className="inline-flex items-center gap-2 border-2 border-navy text-navy font-bold text-sm uppercase tracking-wide px-7 py-4 rounded-full hover:bg-navy hover:text-white transition-colors"
            >
              View Menu
            </a>
          </div>
        </Reveal>

        <Reveal delay={150} className="relative">
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <div className="col-span-2 relative rounded-[32px] bg-navy p-6 pb-8 shadow-card overflow-hidden">
              <div className="h-40 md:h-48 rounded-xl overflow-hidden">
                <img src={saladBowlImg} alt="Protein Salad Bowl" className="w-full h-full object-cover" />
              </div>
              <p className="mt-3 font-display font-bold text-white text-lg">Protein Salad Bowl</p>
            </div>
            <div className="relative rounded-[28px] bg-lightgreen p-5 shadow-card">
              <div className="h-28 md:h-32 rounded-lg overflow-hidden">
                <img src={wrapImg} alt="Protein Wrap" className="w-full h-full object-cover" />
              </div>
              <p className="mt-2 font-display font-bold text-navy text-sm">Protein Wrap</p>
            </div>
            <div className="relative rounded-[28px] bg-white p-5 shadow-card">
              <div className="h-28 md:h-32 rounded-lg overflow-hidden">
                <img src={shakeImg} alt="Protein Shake" className="w-full h-full object-cover" />
              </div>
              <p className="mt-2 font-display font-bold text-navy text-sm">Protein Shake</p>
            </div>
          </div>
          <div className="hidden md:flex absolute -bottom-6 -left-8 items-center gap-3 bg-white rounded-2xl shadow-card px-5 py-4">
            <div className="w-11 h-11 rounded-full bg-yellow flex items-center justify-center font-display font-extrabold text-navy">
              B
            </div>
            <div className="leading-tight">
              <p className="font-bold text-navy text-sm">30g+ protein</p>
              <p className="text-ink/60 text-xs">in every meal bowl</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
