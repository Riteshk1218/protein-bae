import { Leaf, Dumbbell, MapPinned, Smile } from 'lucide-react'
import Reveal from './ui/Reveal'
import RingBadge from './ui/RingBadge'
import SwooshDivider from './ui/SwooshDivider'

const features = [
  { icon: Leaf, title: 'Fresh', copy: 'Fresh ingredients prepared for everyday eating.' },
  { icon: Dumbbell, title: 'Better Protein', copy: 'Protein-focused meals designed for an active lifestyle.' },
  { icon: MapPinned, title: 'Convenient', copy: 'Find us, order online and pick up from the truck.' },
  { icon: Smile, title: 'Actually Tasty', copy: 'Healthy food should be something you genuinely enjoy eating.' },
]

export default function WhyProteinBae() {
  return (
    <section className="relative bg-lightgreen">
      <SwooshDivider color="#FAF9F4" flip />
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-20 md:pb-28">
        <Reveal className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
            Why Protein Bae?
          </h2>
          <p className="mt-3 text-ink/60">Because eating better shouldn&apos;t mean eating boring.</p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="h-full bg-white rounded-[24px] p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center">
                <RingBadge tone="green" size="lg" className="mx-auto">
                  <f.icon size={26} strokeWidth={2.2} />
                </RingBadge>
                <h3 className="font-display font-bold text-lg text-navy mt-5">{f.title}</h3>
                <p className="text-ink/60 text-sm mt-2 leading-relaxed">{f.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
