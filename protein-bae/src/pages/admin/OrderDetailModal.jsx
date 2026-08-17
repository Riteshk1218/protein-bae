import { useEffect, useState } from 'react'
import { X, Mail, Phone, Clock, Truck } from 'lucide-react'
import { getOrder, recordPayment, updateOrderStatus } from '../../services/api'

const STATUS_FLOW = ['received', 'preparing', 'ready', 'completed']
const STATUS_LABEL = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
const PAYMENT_METHODS = ['Cash', 'Google Pay / UPI', 'PhonePe', 'Paytm', 'Card', 'Bank Transfer', 'Other']

function nextStatus(status) {
  const idx = STATUS_FLOW.indexOf(status)
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[idx + 1]
}

export default function OrderDetailModal({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [method, setMethod] = useState('Cash')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const load = () => {
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const changeStatus = async (status) => {
    try {
      await updateOrderStatus(orderId, status)
      load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setPayError('')
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setPayError('Enter a valid amount.')
      return
    }
    setPaying(true)
    try {
      await recordPayment(orderId, { paymentMethod: method, amount: numeric, note: note.trim() || null })
      setAmount('')
      setNote('')
      load()
      onChanged?.()
    } catch (err) {
      setPayError(err.message || 'Could not record payment.')
    } finally {
      setPaying(false)
    }
  }

  const upNext = order ? nextStatus(order.status) : null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[24px] shadow-2xl p-6 md:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 text-navy/50 hover:text-navy">
          <X size={20} />
        </button>

        {loading && <p className="text-ink/50 text-sm">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {order && (
          <>
            <p className="font-display font-bold text-xl text-navy">Order #{order.id}</p>
            <p className="text-ink/50 text-sm mt-1">{order.created_at}</p>

            <div className="mt-4 space-y-1.5 text-sm">
              <p className="font-semibold text-navy">{order.customer_name}</p>
              {order.customer_email && (
                <p className="inline-flex items-center gap-1.5 text-ink/60">
                  <Mail size={13} /> {order.customer_email}
                </p>
              )}
              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="inline-flex items-center gap-1.5 text-green font-semibold hover:underline"
                >
                  <Phone size={13} /> {order.customer_phone}
                </a>
              )}
              {order.pickup_time && (
                <p className="inline-flex items-center gap-1.5 text-ink/60">
                  <Clock size={13} /> Pickup {order.pickup_time}
                </p>
              )}
              {order.truck && (
                <p className="inline-flex items-center gap-1.5 text-ink/60">
                  <Truck size={13} /> {order.truck.name}
                </p>
              )}
            </div>

            <ul className="mt-5 pt-5 border-t border-navy/8 divide-y divide-navy/8 text-sm">
              {order.items.map((item, idx) => (
                <li key={`${item.id}-${idx}`} className="py-2">
                  <div className="flex items-center justify-between">
                    <span>{item.name} &times; {item.qty}</span>
                    <span className="font-semibold text-navy">₹{item.price * item.qty}</span>
                  </div>
                  {item.customization && (
                    <p className="text-green text-xs mt-0.5">{item.customization}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-3 border-t border-navy/8 space-y-1 text-sm">
              <div className="flex items-center justify-between text-ink/60">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-green font-semibold">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-display font-extrabold text-navy text-base">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="mt-5 flex flex-wrap gap-2">
                {upNext && (
                  <button
                    type="button"
                    onClick={() => changeStatus(upNext)}
                    className="bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-green transition-colors"
                  >
                    Mark {STATUS_LABEL[upNext]}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => changeStatus('cancelled')}
                  className="text-red-500 text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-navy/8">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-bold text-navy text-sm">Payments</p>
                <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-lightgreen text-green">
                  {order.payment_status}
                </span>
              </div>

              {order.payments?.length > 0 && (
                <ul className="space-y-1.5 text-sm mb-3">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-ink/70">
                      <span>{p.payment_method}</span>
                      <span className="font-semibold text-navy">₹{p.amount}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between text-sm font-semibold text-navy mb-4">
                <span>Paid ₹{order.paid} &middot; Remaining ₹{order.remaining}</span>
              </div>

              {order.remaining > 0 && (
                <form onSubmit={handlePayment} className="grid grid-cols-2 gap-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="col-span-1 rounded-xl border border-navy/15 px-3 py-2.5 text-sm focus:border-green outline-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder={`Up to ₹${order.remaining}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="col-span-1 rounded-xl border border-navy/15 px-3 py-2.5 text-sm focus:border-green outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="col-span-2 rounded-xl border border-navy/15 px-3 py-2.5 text-sm focus:border-green outline-none"
                  />
                  {payError && <p className="col-span-2 text-red-600 text-xs">{payError}</p>}
                  <button
                    type="submit"
                    disabled={paying}
                    className="col-span-2 bg-yellow text-navy-deep font-bold text-xs uppercase tracking-wide py-3 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
                  >
                    {paying ? 'Recording…' : 'Record Payment'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
