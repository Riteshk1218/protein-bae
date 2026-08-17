import { Phone, MapPin, Clock } from 'lucide-react'
import OrderStatusTimeline from './OrderStatusTimeline'

const PAYMENT_TONE = {
  UNPAID: 'bg-navy/10 text-navy/60',
  PARTIAL: 'bg-yellow/20 text-yellow-deep',
  PAID: 'bg-lightgreen text-green',
  REFUNDED: 'bg-red-50 text-red-500',
}

export default function OrderSummaryCard({ order, children }) {
  return (
    <div className="bg-white rounded-[24px] shadow-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display font-bold text-xl text-navy">Order #{order.id}</p>
          <p className="text-ink/50 text-sm mt-1">{order.created_at}</p>
        </div>
        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
            PAYMENT_TONE[order.payment_status] || PAYMENT_TONE.UNPAID
          }`}
        >
          {order.payment_status}
        </span>
      </div>

      <div className="mt-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      {order.truck && (
        <div className="mt-6 bg-lightgreen/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display font-bold text-navy text-sm">{order.truck.name}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink/60">
              {order.pickup_time && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-green" /> Pickup {order.pickup_time}
                </span>
              )}
              {order.truck.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-green" /> {order.truck.address}
                </span>
              )}
            </div>
          </div>
          {order.truck.phone && (
            <a
              href={`tel:${order.truck.phone}`}
              className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-navy-deep transition-colors"
            >
              <Phone size={13} /> Call Truck
            </a>
          )}
        </div>
      )}

      <ul className="mt-8 divide-y divide-navy/8 border-t border-navy/8">
        {order.items.map((item, idx) => (
          <li key={`${item.id}-${idx}`} className="py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/70">
                {item.name} <span className="text-ink/40">&times; {item.qty}</span>
              </span>
              <span className="font-semibold text-navy">₹{item.price * item.qty}</span>
            </div>
            {item.customization && <p className="text-green text-xs mt-0.5">{item.customization}</p>}
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-navy/8 space-y-1.5 text-sm">
        <div className="flex items-center justify-between text-ink/60">
          <span>Subtotal</span>
          <span>₹{order.subtotal ?? order.total}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-green font-semibold">
            <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
            <span>-₹{order.discount}</span>
          </div>
        )}
        <div className="flex items-center justify-between font-display font-extrabold text-navy text-lg pt-1">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
        {order.paid != null && (
          <>
            <div className="flex items-center justify-between text-ink/50 pt-1">
              <span>Paid</span>
              <span>₹{order.paid}</span>
            </div>
            {order.remaining > 0 && (
              <div className="flex items-center justify-between text-ink/50">
                <span>Remaining</span>
                <span>₹{order.remaining}</span>
              </div>
            )}
          </>
        )}
      </div>

      {children}
    </div>
  )
}
