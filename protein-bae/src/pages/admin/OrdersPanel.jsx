import { useState } from 'react'
import { Phone, Clock, StickyNote, RefreshCcw } from 'lucide-react'
import OrderDetailModal from './OrderDetailModal'

const STATUS_FLOW = ['received', 'preparing', 'ready', 'completed']
const STATUS_LABEL = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
const STATUS_TONE = {
  received: 'bg-yellow/20 text-yellow-deep',
  preparing: 'bg-navy/10 text-navy',
  ready: 'bg-lightgreen text-green',
  completed: 'bg-navy text-white',
  cancelled: 'bg-red-50 text-red-600',
}
const PAYMENT_TONE = {
  UNPAID: 'bg-navy/10 text-navy/50',
  PARTIAL: 'bg-yellow/20 text-yellow-deep',
  PAID: 'bg-lightgreen text-green',
  REFUNDED: 'bg-red-50 text-red-500',
}

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(`${iso.replace(' ', 'T')}Z`).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  return `${hrs}h ago`
}

export default function OrdersPanel({ orders, loading, onStatusChange, onRefresh }) {
  const [openOrderId, setOpenOrderId] = useState(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg text-navy">Incoming Orders</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 text-navy/60 text-sm font-semibold hover:text-navy transition-colors"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {loading && orders.length === 0 && (
        <p className="text-ink/50 text-sm">Loading orders…</p>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-[22px] shadow-card p-10 text-center">
          <p className="text-navy font-semibold">No orders yet.</p>
          <p className="text-ink/50 text-sm mt-1">
            New customer orders will show up here automatically.
          </p>
        </div>
      )}

      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="bg-white rounded-[22px] shadow-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-display font-bold text-navy">#{order.id}</span>
                  <span className="font-semibold text-navy">{order.customer_name}</span>
                  {order.source === 'admin' && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-navy/10 text-navy/60 px-2 py-0.5 rounded-full">
                      Walk-up
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink/50">
                  {order.customer_phone && (
                    <a
                      href={`tel:${order.customer_phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-green font-semibold hover:underline"
                    >
                      <Phone size={12} /> {order.customer_phone}
                    </a>
                  )}
                  {order.pickup_time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> Pickup {order.pickup_time}
                    </span>
                  )}
                  <span>{timeAgo(order.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${STATUS_TONE[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${PAYMENT_TONE[order.payment_status] || PAYMENT_TONE.UNPAID}`}
                >
                  {order.payment_status || 'UNPAID'}
                </span>
              </div>
            </div>

            <ul className="mt-4 text-sm text-ink/70 divide-y divide-navy/5">
              {order.items.map((item, idx) => (
                <li key={`${item.id}-${idx}`} className="py-1.5">
                  <div className="flex items-center justify-between">
                    <span>
                      {item.qty} &times; {item.name}
                    </span>
                    <span className="font-medium text-navy">₹{item.price * item.qty}</span>
                  </div>
                  {item.customization && (
                    <p className="text-green text-xs mt-0.5">{item.customization}</p>
                  )}
                </li>
              ))}
            </ul>

            {order.notes && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-ink/50">
                <StickyNote size={13} className="shrink-0 mt-0.5" /> {order.notes}
              </p>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy/8">
              <span className="font-display font-extrabold text-navy">₹{order.total}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenOrderId(order.id)}
                  className="text-navy text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full border border-navy/15 hover:border-navy transition-colors"
                >
                  View / Payment
                </button>

                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onStatusChange(order.id, 'cancelled')}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 px-2"
                    >
                      Cancel
                    </button>
                    {(() => {
                      const nextIndex = STATUS_FLOW.indexOf(order.status) + 1
                      const next = STATUS_FLOW[nextIndex]
                      if (!next) return null
                      return (
                        <button
                          type="button"
                          onClick={() => onStatusChange(order.id, next)}
                          className="bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full hover:bg-green transition-colors"
                        >
                          Mark {STATUS_LABEL[next]}
                        </button>
                      )
                    })()}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {openOrderId && (
        <OrderDetailModal
          orderId={openOrderId}
          onClose={() => setOpenOrderId(null)}
          onChanged={onRefresh}
        />
      )}
    </div>
  )
}
