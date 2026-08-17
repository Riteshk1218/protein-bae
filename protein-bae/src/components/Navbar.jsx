import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu as MenuIcon, X, MapPin, ShoppingBag, User } from 'lucide-react'
import { navLinks } from '../data/nav'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import logoMark from '../assets/logo-mark.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count, openCart } = useCart()
  const { customer } = useCustomerAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-offwhite/85 backdrop-blur-md shadow-[0_1px_0_rgba(23,33,59,0.08)]' : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 h-[76px]"
        aria-label="Primary"
      >
        <a href="#home" className="flex items-center gap-2 shrink-0" onClick={close}>
          <img src={logoMark} alt="Protein Bae" className="h-11 w-11 rounded-full object-cover" />
          <span className="font-display font-bold text-lg text-navy leading-none hidden sm:block">
            Protein Bae
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-9 font-semibold text-[13px] tracking-wide text-navy uppercase">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-green transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href="#truck"
            className="inline-flex items-center gap-1.5 text-navy font-bold text-[13px] uppercase tracking-wide hover:text-green transition-colors"
          >
            <MapPin size={16} strokeWidth={2.5} />
            Find Our Truck
          </a>
          <Link
            to={customer ? '/my-orders' : '/login'}
            className="inline-flex items-center gap-1.5 text-navy font-bold text-[13px] uppercase tracking-wide hover:text-green transition-colors"
          >
            <User size={16} strokeWidth={2.5} />
            {customer ? customer.name.split(' ')[0] : 'Sign In'}
          </Link>
          <button
            type="button"
            onClick={() => {
              if (count > 0) {
                openCart()
              } else {
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="relative inline-flex items-center gap-2 bg-yellow text-navy-deep font-bold text-[13px] uppercase tracking-wide px-5 py-3 rounded-full hover:bg-yellow-deep hover:-translate-y-0.5 transition-all shadow-[0_6px_16px_-6px_rgba(242,194,26,0.7)]"
          >
            {count > 0 && <ShoppingBag size={15} />}
            {count > 0 ? `Order Now (${count})` : 'Order Now'}
          </button>
        </div>

        <div className="flex lg:hidden items-center gap-3">
          <button
            type="button"
            onClick={() => (count > 0 ? openCart() : document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }))}
            aria-label={`Order now${count ? `, ${count} items in cart` : ''}`}
            className="relative bg-yellow text-navy-deep font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-full"
          >
            Order
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="p-2 text-navy"
          >
            {open ? <X size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-offwhite border-t border-navy/10 px-5 pb-6 pt-2 shadow-lg"
        >
          <ul className="flex flex-col gap-1 font-semibold text-navy">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block py-3 text-base border-b border-navy/5 last:border-none"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#truck"
                onClick={close}
                className="flex items-center gap-2 py-3 text-base text-green font-bold"
              >
                <MapPin size={18} /> Find Our Truck
              </a>
            </li>
            <li>
              <Link
                to={customer ? '/my-orders' : '/login'}
                onClick={close}
                className="flex items-center gap-2 py-3 text-base text-navy font-bold border-t border-navy/5"
              >
                <User size={18} /> {customer ? 'My Orders' : 'Sign In'}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
