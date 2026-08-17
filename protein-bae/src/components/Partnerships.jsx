import { useState } from 'react'
import Reveal from './ui/Reveal'
import SwooshDivider from './ui/SwooshDivider'
import partnershipImg from '../assets/images/partnership.jpg'
import PartnershipFormModal from './PartnershipFormModal'
import ContactFormModal from './ContactFormModal'

export default function Partnerships() {
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <section id="partnerships" className="relative bg-navy text-white overflow-hidden">
      <SwooshDivider color="#EAF4E8" />

      <img
        src={partnershipImg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute top-10 right-[-100px] w-72 h-72 rounded-full border-[22px] border-green/25" aria-hidden="true" />

      <div className="relative max-w-4xl mx-auto px-5 md:px-8 pb-24 md:pb-32 pt-2 text-center">
        <Reveal>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">
            Bring Protein Bae to Your Community
          </h2>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto leading-relaxed">
            Have a gym, yoga studio, sports club, office, residential community
            or fitness event?
          </p>
          <p className="mt-2 text-white/70 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s bring fresh, protein-focused food closer to your people.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setShowPartnerForm(true)}
              className="bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:bg-yellow-deep hover:-translate-y-0.5 transition-all shadow-[0_10px_24px_-8px_rgba(242,194,26,0.6)]"
            >
              Partner With Us
            </button>
            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              className="border-2 border-white/40 text-white font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:border-white hover:bg-white/10 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </Reveal>
      </div>

      {showPartnerForm && <PartnershipFormModal onClose={() => setShowPartnerForm(false)} />}
      {showContactForm && <ContactFormModal onClose={() => setShowContactForm(false)} />}
    </section>
  )
}
