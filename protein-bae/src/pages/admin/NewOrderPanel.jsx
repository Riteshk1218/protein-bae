import { useEffect, useState } from 'react'
import { Minus, Plus, CheckCircle2 } from 'lucide-react'
import { getMenu, createManualOrder, getTodaysTruckLocation } from '../../services/api'
import { menuItems as fallbackItems } from '../../data/menu'

export default function NewOrderPanel({ onCreated }) {
  const [menu, setMenu] = useState(fallbackItems)
  const [truck, setTruck] = useState(null)
  const [qtyById, setQtyById] = useState({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', pickupTime: '', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getMenu()
      .then(setMenu)
      .catch(() => setMenu(fallbackItems))
    getTodaysTruckLocation()
      .then(setTruck)
      .catch(() => setTruck(null))
  }, [])

  const setQty = (id, qty) => {
    setQtyById((prev) => {
      const next = { ...prev, [id]: Math.max(0, qty) }
      if (next[id] === 0) delete next[id]
      return next
    })
  }

  const items = Object.entries(qtyById).map(([id, qty]) => ({ id, qty }))
  const total = items.reduce((sum, i) => {
    const menuItem = menu.find((m) => m.id === i.id)
    return sum + (menuItem ? menuItem.price * i.qty : 0)
  }, 0)

  const reset = () => {
    setQtyById({})
    setForm({ name: '', email: '', phone: '', pickupTime: '', notes: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    if (!form.name.trim()) {
      setError('Add the customer name.')
      return
    }
    if (items.length === 0) {
      setError('Add at least one item.')
      return
    }
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setSubmitting(true)
    try {
      const order = await createManualOrder({
        customerName: form.name.trim(),
        customerEmail: form.email.trim() || undefined,
        customerPhone: form.phone.trim() || undefined,
        items,
        pickupTime: form.pickupTime.trim() || undefined,
        notes: form.notes.trim() || undefined,
      })
      setSuccess(order)
      reset()
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Could not create the order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-white rounded-[22px] shadow-card p-6">
        <h2 className="font-display font-bold text-lg text-navy mb-4">Add Items</h2>
        <ul className="divide-y divide-navy/5">
          {menu.filter((item) => item.available).map((item) => {
            const qty = qtyById[item.id] || 0
            return (
              <li key={item.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-semibold text-navy text-sm">{item.name}</p>
                  <p className="text-ink/50 text-xs mt-0.5">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 bg-offwhite rounded-full border border-navy/10 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, qty - 1)}
                    aria-label={`Decrease ${item.name} quantity`}
                    className="p-1.5 text-navy hover:text-green"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-navy">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, qty + 1)}
                    aria-label={`Increase ${item.name} quantity`}
                    className="p-1.5 text-navy hover:text-green"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-[22px] shadow-card p-6 h-fit">
        <h2 className="font-display font-bold text-lg text-navy mb-4">Customer Details</h2>
        <div className="space-y-3.5">
          <div>
            <label htmlFor="admin-name" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Name
            </label>
            <input
              id="admin-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              placeholder="Walk-up customer"
            />
          </div>
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Email (optional)
            </label>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              placeholder="For a confirmation email"
            />
          </div>
          <div>
            <label htmlFor="admin-phone" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Phone (optional)
            </label>
            <input
              id="admin-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label htmlFor="admin-pickup" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Pickup Time (optional)
            </label>
            {truck?.pickupSlots?.length > 0 ? (
              <select
                id="admin-pickup"
                value={form.pickupTime}
                onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              >
                <option value="">Now / walk-up</option>
                {truck.pickupSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-ink/40 text-xs bg-navy/5 rounded-xl px-4 py-2.5">Leave blank for immediate pickup.</p>
            )}
          </div>
          <div>
            <label htmlFor="admin-notes" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="admin-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none resize-none"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 text-green text-sm mt-3">
            <CheckCircle2 size={15} /> Order #{success.id} created.
          </p>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-navy/10">
          <span className="text-ink/60 text-sm">Total</span>
          <span className="font-display font-extrabold text-navy text-lg">₹{total}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}
