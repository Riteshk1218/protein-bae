import { MessageCircle, Phone, Mail } from 'lucide-react'
import { navLinks } from '../data/nav'
import logoMark from '../assets/logo-mark.png'

// lucide-react no longer ships brand marks, so Instagram/Facebook use
// small inline glyphs to match the icon-in-a-circle treatment below.
function InstagramGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function FacebookGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 8.5h-2a2 2 0 0 0-2 2V21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h4" strokeLinecap="round" />
      <rect x="3" y="3" width="18" height="18" rx="5" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logoMark} alt="Protein Bae" className="h-11 w-11 rounded-full object-cover" />
            <span className="font-display font-bold text-lg">Protein Bae</span>
          </div>
          <p className="mt-4 font-display font-semibold text-yellow text-sm">
            Protein Before Anything Else.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wide text-white/50">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-yellow transition-colors">{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#partnerships" className="hover:text-yellow transition-colors">Contact</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wide text-white/50">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-green" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-green" /> hello@proteinbae.in
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wide text-white/50">Follow</h4>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" aria-label="Protein Bae on Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow hover:text-navy-deep transition-colors">
              <InstagramGlyph width={17} height={17} />
            </a>
            <a href="#" aria-label="Protein Bae on WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow hover:text-navy-deep transition-colors">
              <MessageCircle size={17} />
            </a>
            <a href="#" aria-label="Protein Bae on Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow hover:text-navy-deep transition-colors">
              <FacebookGlyph width={17} height={17} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="max-w-7xl mx-auto px-5 md:px-8 py-6 text-center text-xs text-white/40">
          © 2026 Protein Bae. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
