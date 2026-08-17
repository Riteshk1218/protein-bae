import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, CheckCircle2, Tag, Phone, MapPin, Clock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { createOrder, validateCoupon as validateCouponApi, getTodaysTruckLocation } from '../services/api'

const PHONE_RE = /^\d{10}$/

export default function CartDrawer() {
  const { items, updateQty, removeItem, clearCart, total, isOpen, closeCart } = useCart()
  const { customer } = useCustomerAuth()
  const [step, setStep] = useState('cart') // cart | details | success
  const [form, setForm] = useState({ name: '', email: '', phone: '', pickupTime: '', notes: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [truck, setTruck] = useState(null)

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null) // { code, discount }
  const [couponError, setCouponError] = useState('')
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  useEffect(() => {
    if (customer) {
      setForm((f) => ({ ...f, name: f.name || customer.name, email: f.email || customer.email, phone: f.phone || customer.phone || '' }))
    }
  }, [customer])

  useEffect(() => {
    if (isOpen && !truck) {
      getTodaysTruckLocation()
        .then(setTruck)
        .catch(() => setTruck(null))
    }
  }, [isOpen, truck])

  if (!isOpen) return null

  const grandTotal = Math.max(0, total - (coupon?.discount || 0))

  const close = () => {
    closeCart()
    setStep('cart')
    setError('')
  }

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponError('')
    setCheckingCoupon(true)
    try {
      const result = await validateCouponApi(couponInput.trim(), total)
      setCoupon({ code: result.code, discount: result.discount })
    } catch (err) {
      setCoupon(null)
      setCouponError(err.message || 'Coupon is invalid or expired.')
    } finally {
      setCheckingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please add your name, email and phone number.')
      return
    }
    if (!PHONE_RE.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setSubmitting(true)
    try {
      const order = await createOrder({
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        items: items.map((i) => ({ id: i.id, qty: i.qty, customization: i.customization || undefined })),
        pickupTime: form.pickupTime.trim() || null,
        notes: form.notes.trim() || null,
        couponCode: coupon?.code || null,
      })
      setPlacedOrder(order)
      setStep('success')
      clearCart()
    } catch (err) {
      setError(err.message || 'Could not place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md h-full bg-offwhite shadow-2xl flex flex-col cart-drawer-panel">
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy/10">
          <h2 className="font-display font-bold text-lg text-navy">
            {step === 'success' ? 'Order Placed' : 'Your Order'}
          </h2>
          <button type="button" onClick={close} aria-label="Close" className="p-1.5 text-navy hover:text-green">
            <X size={22} />
          </button>
        </div>

        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <p className="text-ink/60 text-sm mt-10 text-center">
                  Your order is empty. Add something tasty from the menu.
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.key} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-navy text-sm">{item.name}</p>
                        {item.customization && (
                          <p className="text-green text-xs mt-0.5">{item.customization}</p>
                        )}
                        <p className="text-ink/50 text-xs mt-0.5">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-full border border-navy/10 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="p-1 text-navy hover:text-green"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-navy">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="p-1 text-navy hover:text-green"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-ink/40 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 && (
                <div className="mt-6">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-lightgreen rounded-xl px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-green text-sm font-bold">
                        <Tag size={14} /> {coupon.code} applied
                      </span>
                      <button type="button" onClick={removeCoupon} className="text-green/70 text-xs font-semibold underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1 rounded-xl border border-navy/15 px-4 py-2.5 text-sm uppercase focus:border-green outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={checkingCoupon}
                        className="bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 rounded-xl hover:bg-navy-deep transition-colors disabled:opacity-60"
                      >
                        {checkingCoupon ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-navy/10 bg-white">
                {coupon && (
                  <div className="flex items-center justify-between mb-1.5 text-sm text-ink/60">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex items-center justify-between mb-1.5 text-sm text-green font-semibold">
                    <span>Discount</span>
                    <span>-₹{coupon.discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-ink/60 text-sm">Total</span>
                  <span className="font-display font-extrabold text-navy text-xl">₹{grandTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-4 rounded-full hover:bg-yellow-deep transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
            <div className="space-y-4 flex-1">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                  placeholder="e.g. Aditi Shah"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                  placeholder="e.g. aditi@example.com"
                />
                <p className="text-ink/40 text-xs mt-1">We&apos;ll email your order confirmation and status updates here.</p>
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label htmlFor="pickupTime" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                  Pickup Time (optional)
                </label>
                {truck?.pickupSlots?.length > 0 ? (
                  <select
                    id="pickupTime"
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                    className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                  >
                    <option value="">As soon as possible</option>
                    {truck.pickupSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-ink/40 text-xs bg-navy/5 rounded-xl px-4 py-3">
                    Pickup scheduling isn&apos;t available right now — we&apos;ll have your order ready as soon as possible.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none resize-none"
                  placeholder="Any allergies or requests?"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>

            <div className="mt-5 pt-5 border-t border-navy/10 space-y-3">
              {coupon && (
                <div className="flex items-center justify-between text-sm text-green font-semibold">
                  <span>{coupon.code} discount</span>
                  <span>-₹{coupon.discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-ink/60 text-sm">Total</span>
                <span className="font-display font-extrabold text-navy text-xl">₹{grandTotal}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-4 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
              >
                {submitting ? 'Placing Order…' : 'Place Order'}
              </button>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="w-full text-navy/60 text-sm font-semibold py-1"
              >
                Back to cart
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-8">
            <CheckCircle2 size={52} className="text-green" />
            <h3 className="font-display font-bold text-xl text-navy mt-4">Order Confirmed</h3>
            <p className="text-ink/60 text-sm mt-2 max-w-xs">
              Thanks, {placedOrder?.customer_name?.split(' ')[0]}! Order #{placedOrder?.id} has been sent to the truck.
            </p>

            {placedOrder?.truck && (
              <div className="mt-5 w-full bg-lightgreen/60 rounded-2xl p-5 text-left space-y-2.5">
                <p className="font-display font-bold text-navy text-sm">{placedOrder.truck.name}</p>
                {placedOrder?.pickup_time && (
                  <p className="inline-flex items-center gap-2 text-ink/70 text-sm">
                    <Clock size={14} className="text-green shrink-0" /> Pickup {placedOrder.pickup_time}
                  </p>
                )}
                {placedOrder.truck.address && (
                  <p className="inline-flex items-center gap-2 text-ink/70 text-sm">
                    <MapPin size={14} className="text-green shrink-0" /> {placedOrder.truck.address}
                  </p>
                )}
                {placedOrder.truck.phone && (
                  <a
                    href={`tel:${placedOrder.truck.phone}`}
                    className="inline-flex items-center gap-2 bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-navy-deep transition-colors mt-1"
                  >
                    <Phone size={13} /> Call Truck
                  </a>
                )}
              </div>
            )}

            {placedOrder?.emailWarning && (
              <p className="text-yellow-deep text-xs mt-3 max-w-xs bg-yellow/10 rounded-lg px-3 py-2">
                {placedOrder.emailWarning}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2 w-full">
              <Link
                to={`/track/${placedOrder?.id}`}
                onClick={close}
                className="bg-navy text-white font-bold text-sm uppercase tracking-wide px-8 py-3.5 rounded-full hover:bg-navy-deep transition-colors"
              >
                Track This Order
              </Link>
              <button
                type="button"
                onClick={close}
                className="text-navy/60 text-sm font-semibold py-1"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
