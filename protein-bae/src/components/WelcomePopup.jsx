import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import logoMark from '../assets/logo-mark.png'

const SESSION_KEY = 'proteinbae_welcome_shown'

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }, [])

  if (!visible) return null

  const close = () => setVisible(false)

  const goTo = (id) => {
    close()
    // Let the popup unmount before scrolling so layout has settled.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl p-8 text-center">
        <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 text-navy/40 hover:text-navy">
          <X size={20} />
        </button>

        <img src={logoMark} alt="Protein Bae" className="w-16 h-16 rounded-full object-cover mx-auto" />

        <h2 className="font-display font-extrabold text-navy text-xl mt-4">
          Welcome to Protein Bae
        </h2>
        <p className="font-display font-semibold text-green mt-1.5">
          Fresh Food. Better Protein. Every Day.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => goTo('menu')}
            className="bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors"
          >
            View Menu
          </button>
          <button
            type="button"
            onClick={() => goTo('menu')}
            className="border-2 border-navy text-navy font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-navy hover:text-white transition-colors"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  )
}
