import { useState } from 'react'
import { X } from 'lucide-react'

export default function CustomizeItemModal({ item, onClose, onConfirm }) {
  const [removed, setRemoved] = useState([])
  const [note, setNote] = useState('')

  const toggle = (ingredient) => {
    setRemoved((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
    )
  }

  const handleConfirm = () => {
    const parts = []
    if (removed.length > 0) parts.push(`No: ${removed.join(', ')}`)
    if (note.trim()) parts.push(note.trim())
    onConfirm(parts.join(' — '))
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-lg text-navy">Customize</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-navy/40 hover:text-navy">
            <X size={20} />
          </button>
        </div>
        <p className="text-ink/50 text-sm mb-5">{item.name}</p>

        {item.ingredients?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-navy/70 mb-2.5">
              Leave out any ingredients?
            </p>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ing) => {
                const active = removed.includes(ing)
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggle(ing)}
                    className={`text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                      active
                        ? 'bg-red-50 border-red-200 text-red-500 line-through'
                        : 'border-navy/15 text-navy hover:border-navy/40'
                    }`}
                  >
                    {ing}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <label htmlFor="customize-note" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
          Anything else? (optional)
        </label>
        <textarea
          id="customize-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. extra spicy, less sauce"
          className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none resize-none"
        />

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full mt-5 bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors"
        >
          Add to Order
        </button>
      </div>
    </div>
  )
}
