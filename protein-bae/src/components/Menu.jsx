import { useEffect, useState } from 'react'
import { Flame, Beef } from 'lucide-react'
import { getMenu } from '../services/api'
import { menuItems as fallbackItems } from '../data/menu'
import { useCart } from '../context/CartContext'
import Reveal from './ui/Reveal'
import DishArt from './ui/DishArt'
import CustomizeItemModal from './CustomizeItemModal'

export default function Menu() {
  const [items, setItems] = useState(fallbackItems)
  const { addItem } = useCart()
  const [customizing, setCustomizing] = useState(null) // the menu item being customized, or null

  useEffect(() => {
    getMenu()
      .then(setItems)
      .catch(() => setItems(fallbackItems))
  }, [])

  const handleAddClick = (item) => {
    if (!item.available) return
    if (item.ingredients?.length > 0) {
      setCustomizing(item)
    } else {
      addItem(item)
    }
  }

  return (
    <section id="menu" className="bg-offwhite py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
            Good Food. Serious Protein.
          </h2>
          <p className="mt-3 text-ink/60">
            Protein-packed meals made to keep up with your everyday life.
          </p>
        </Reveal>

        <div id="menu-grid" className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 90}>
              <article className="group h-full flex flex-col bg-white rounded-[26px] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300">
                <div className="relative rounded-[18px] bg-lightgreen h-40 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full p-4 transition-transform duration-500 group-hover:scale-110">
                      <DishArt variant={item.art} />
                    </div>
                  )}
                  {!item.available && (
                    <div className="absolute inset-0 bg-navy-deep/60 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wide bg-red-500/90 px-3 py-1.5 rounded-full">
                        Currently Unavailable
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-display font-bold text-lg text-navy mt-5">{item.name}</h3>
                <p className="text-ink/60 text-sm mt-2 leading-relaxed flex-1">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-navy/70">
                  <span className="inline-flex items-center gap-1">
                    <Beef size={14} className="text-green" /> {item.protein}g protein
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flame size={14} className="text-yellow-deep" /> {item.calories} cal
                  </span>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-navy/8">
                  <span className="font-display font-extrabold text-navy text-lg">
                    ₹{item.price}
                  </span>
                  {item.available ? (
                    <button
                      type="button"
                      onClick={() => handleAddClick(item)}
                      className="bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-green transition-colors"
                    >
                      Add to Order
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="bg-navy/15 text-navy/40 text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="text-center mt-12">
          <a
            href="#menu-grid"
            className="inline-flex items-center gap-2 border-2 border-navy text-navy font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:bg-navy hover:text-white transition-colors"
          >
            View Full Menu
          </a>
        </Reveal>
      </div>

      {customizing && (
        <CustomizeItemModal
          item={customizing}
          onClose={() => setCustomizing(null)}
          onConfirm={(customization) => {
            addItem(customizing, customization)
            setCustomizing(null)
          }}
        />
      )}
    </section>
  )
}
