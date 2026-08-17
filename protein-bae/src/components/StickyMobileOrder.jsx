import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function StickyMobileOrder() {
  const { count, total, openCart } = useCart()

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-offwhite via-offwhite/95 to-transparent">
      <button
        type="button"
        onClick={() => (count > 0 ? openCart() : document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }))}
        className="flex items-center justify-center gap-2 w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-4 rounded-full shadow-[0_10px_24px_-6px_rgba(23,33,59,0.35)]"
      >
        <ShoppingBag size={17} />
        {count > 0 ? `View Order (${count}) · ₹${total}` : 'Order Now'}
      </button>
    </div>
  )
}
