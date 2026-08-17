import { steps } from '../data/steps'
import Reveal from './ui/Reveal'
import RingBadge from './ui/RingBadge'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-offwhite py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
            From Truck to Table.
          </h2>
        </Reveal>

        <div className="mt-16 relative">
          {/* connecting line -- desktop only */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-[3px] bg-navy/10" aria-hidden="true" />

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.number} delay={i * 100} className="relative text-center flex flex-col items-center">
                <RingBadge tone="navy" size="lg" className="bg-offwhite relative z-10">
                  {step.number}
                </RingBadge>
                <h3 className="font-display font-bold text-lg text-navy mt-5">{step.title}</h3>
                <p className="text-ink/60 text-sm mt-2 max-w-[200px]">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
