import Reveal from './ui/Reveal'
import aboutImg from '../assets/images/about-us.jpg'

export default function AboutUs() {
  return (
    <section id="about" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal className="order-2 lg:order-1 relative">
          <div className="rounded-[32px] bg-navy p-3 shadow-card overflow-hidden">
            <img
              src={aboutImg}
              alt="Protein Bae team preparing fresh food"
              className="w-full h-80 md:h-[420px] object-cover rounded-[24px]"
            />
          </div>
          <div className="hidden md:block absolute -bottom-7 -right-7 bg-yellow rounded-2xl shadow-card px-6 py-5">
            <p className="font-display font-extrabold text-navy-deep text-2xl leading-none">2026</p>
            <p className="text-navy-deep/80 text-xs font-semibold mt-1">Fresh &amp; growing</p>
          </div>
        </Reveal>

        <Reveal delay={100} className="order-1 lg:order-2">
          <span className="text-green font-bold text-xs uppercase tracking-[0.14em]">
            About Protein Bae
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mt-3 leading-tight">
            A simple idea to make protein-rich food easy, tasty and convenient.
          </h2>
          <p className="mt-5 text-ink/70 leading-relaxed">
            Protein Bae is a food brand built around one simple belief: healthy
            food shouldn&apos;t be boring. It should be something you actually
            look forward to eating.
          </p>
          <p className="mt-4 text-ink/70 leading-relaxed">
            We create delicious, protein-focused meals designed for everyday
            life — whether you&apos;re heading to the gym, finishing a
            workout, heading to work or simply looking for a better meal.
          </p>
          <p className="mt-6 font-display font-bold text-xl text-green">
            Protein Before Anything Else.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
