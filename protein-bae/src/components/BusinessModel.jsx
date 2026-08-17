import { Truck, MapPin, Dumbbell, Trophy, Building2, Home, PartyPopper } from 'lucide-react'
import { channels } from '../data/businessModel'
import Reveal from './ui/Reveal'
import RingBadge from './ui/RingBadge'

const icons = [Truck, MapPin, Dumbbell, Trophy, Building2, Home]

export default function BusinessModel() {
  return (
    <section className="bg-lightgreen py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
            More Ways to Get Your Protein Bae
          </h2>
          <p className="mt-3 text-ink/60">
            Protein Bae meets customers where they already are.
          </p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((c, i) => {
            const Icon = icons[i]
            return (
              <Reveal key={c.title} delay={i * 70}>
                <div className="h-full bg-white rounded-[22px] p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <RingBadge tone="yellow" size="md">
                    <Icon size={20} className="text-navy" strokeWidth={2.2} />
                  </RingBadge>
                  <h3 className="font-display font-bold text-base text-navy mt-4">{c.title}</h3>
                  <p className="text-ink/60 text-sm mt-2 leading-relaxed">{c.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={200} className="mt-8">
          <div className="bg-navy rounded-[22px] p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <RingBadge tone="white" size="md" className="shrink-0">
              <PartyPopper size={20} className="text-white" strokeWidth={2.2} />
            </RingBadge>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Fitness &amp; Wellness Events
              </h3>
              <p className="text-white/70 text-sm mt-1 leading-relaxed">
                Protein Bae can operate as a pop-up food partner at fitness and wellness events.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
