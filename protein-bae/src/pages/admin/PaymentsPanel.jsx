import { useMemo, useState } from 'react'
import OrderDetailModal from './OrderDetailModal'

const PAYMENT_TONE = {
  UNPAID: 'bg-navy/10 text-navy/60',
  PARTIAL: 'bg-yellow/20 text-yellow-deep',
  PAID: 'bg-lightgreen text-green',
  REFUNDED: 'bg-red-50 text-red-500',
}

export default function PaymentsPanel({ orders, onRefresh }) {
  const [openOrderId, setOpenOrderId] = useState(null)

  const outstanding = useMemo(
    () => orders.filter((o) => o.payment_status !== 'PAID' && o.status !== 'cancelled'),
    [orders]
  )
  const settled = useMemo(
    () => orders.filter((o) => o.payment_status === 'PAID'),
    [orders]
  )

  return (
    <div>
      <h2 className="font-display font-bold text-lg text-navy mb-5">Payments</h2>

      <p className="text-navy/60 text-xs font-bold uppercase tracking-wide mb-3">
        Outstanding ({outstanding.length})
      </p>
      {outstanding.length === 0 ? (
        <p className="text-ink/50 text-sm mb-6">Nothing outstanding right now.</p>
      ) : (
        <ul className="space-y-3 mb-8">
          {outstanding.map((order) => (
            <li key={order.id} className="flex items-center justify-between bg-white rounded-2xl shadow-card px-5 py-4">
              <div>
                <p className="font-display font-bold text-navy text-sm">
                  #{order.id} &middot; {order.customer_name}
                </p>
                <p className="text-ink/50 text-xs mt-0.5">{order.created_at}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${PAYMENT_TONE[order.payment_status] || PAYMENT_TONE.UNPAID}`}>
                  {order.payment_status}
                </span>
                <span className="font-display font-extrabold text-navy text-sm">₹{order.total}</span>
                <button
                  type="button"
                  onClick={() => setOpenOrderId(order.id)}
                  className="bg-yellow text-navy-deep text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full hover:bg-yellow-deep transition-colors"
                >
                  Make Payment
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-navy/60 text-xs font-bold uppercase tracking-wide mb-3">Paid ({settled.length})</p>
      <ul className="space-y-2">
        {settled.map((order) => (
          <li key={order.id} className="flex items-center justify-between bg-white/60 rounded-xl px-5 py-3 text-sm">
            <span className="text-ink/60">
              #{order.id} &middot; {order.customer_name}
            </span>
            <span className="font-semibold text-navy">₹{order.total}</span>
          </li>
        ))}
      </ul>

      {openOrderId && (
        <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} onChanged={onRefresh} />
      )}
    </div>
  )
}
