import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { getMyOrders } from '../../services/api'
import CustomerPageHeader from './CustomerPageHeader'

const STATUS_TONE = {
  received: 'bg-yellow/20 text-yellow-deep',
  preparing: 'bg-navy/10 text-navy',
  ready: 'bg-lightgreen text-green',
  completed: 'bg-navy/5 text-navy/50',
  cancelled: 'bg-red-50 text-red-500',
}
const PAYMENT_TONE = {
  UNPAID: 'bg-navy/10 text-navy/60',
  PARTIAL: 'bg-yellow/20 text-yellow-deep',
  PAID: 'bg-lightgreen text-green',
  REFUNDED: 'bg-red-50 text-red-500',
}

export default function MyOrders() {
  const navigate = useNavigate()
  const { customer, loading: authLoading, logout } = useCustomerAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!customer) {
      navigate('/login', { replace: true })
      return
    }
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [customer, authLoading, navigate])

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-navy">My Orders</h1>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="inline-flex items-center gap-1.5 text-navy/60 text-sm font-semibold hover:text-navy transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {loading && <p className="text-ink/50 text-sm mt-8">Loading…</p>}
        {error && <p className="text-red-600 text-sm mt-8">{error}</p>}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center mt-8">
            <p className="text-ink/60 text-sm">No orders yet.</p>
            <Link to="/" className="inline-block mt-4 text-green font-semibold text-sm">
              Browse the menu
            </Link>
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/my-orders/${order.id}`}
                className="flex items-center justify-between bg-white rounded-2xl shadow-card px-5 py-4 hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <p className="font-display font-bold text-navy">Order #{order.id}</p>
                  <p className="text-ink/50 text-xs mt-0.5">{order.created_at}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-navy">₹{order.total}</p>
                  <div className="flex items-center gap-1.5 mt-1 justify-end">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_TONE[order.status]}`}>
                      {order.status}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${PAYMENT_TONE[order.payment_status]}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
