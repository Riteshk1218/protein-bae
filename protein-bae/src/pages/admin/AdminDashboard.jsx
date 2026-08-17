import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { getAdminToken, clearAdminToken, getOrders, updateOrderStatus } from '../../services/api'
import logoMark from '../../assets/logo-mark.png'
import DashboardPanel from './DashboardPanel'
import OrdersPanel from './OrdersPanel'
import NewOrderPanel from './NewOrderPanel'
import PaymentsPanel from './PaymentsPanel'
import ReportsPanel from './ReportsPanel'
import TrucksPanel from './TrucksPanel'
import MenuPanel from './MenuPanel'
import PartnershipsPanel from './PartnershipsPanel'
import ContactPanel from './ContactPanel'
import SettingsPanel from './SettingsPanel'

const POLL_MS = 8000
const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'new-order', label: 'New Order' },
  { id: 'payments', label: 'Payments' },
  { id: 'reports', label: 'Reports' },
  { id: 'trucks', label: 'Food Trucks' },
  { id: 'menu', label: 'Menu' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'contact', label: 'Contact Messages' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  const loadOrders = () => {
    getOrders()
      .then((data) => {
        setOrders(data)
        setError('')
      })
      .catch((err) => {
        if (err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('session')) {
          clearAdminToken()
          navigate('/admin', { replace: true })
          return
        }
        setError(err.message || 'Could not load orders.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, POLL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (id, status) => {
    const previous = orders
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    try {
      await updateOrderStatus(id, status)
    } catch (err) {
      setOrders(previous)
      setError(err.message || 'Could not update order status.')
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    navigate('/admin', { replace: true })
  }

  const newOrdersCount = orders.filter((o) => o.status === 'received').length

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="Protein Bae" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-display font-bold leading-none">Truck Admin</p>
              <p className="text-white/50 text-xs mt-1">Protein Bae</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-white/80 text-sm font-semibold hover:text-white transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <nav className="flex flex-wrap gap-1 mt-6 bg-white rounded-2xl p-1.5 w-fit shadow-card max-w-full overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'
              }`}
            >
              {t.label}
              {t.id === 'orders' && newOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow text-navy-deep text-[10px] font-bold flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {error && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="py-8">
          {tab === 'dashboard' && <DashboardPanel />}
          {tab === 'orders' && (
            <OrdersPanel orders={orders} loading={loading} onStatusChange={handleStatusChange} onRefresh={loadOrders} />
          )}
          {tab === 'new-order' && <NewOrderPanel onCreated={loadOrders} />}
          {tab === 'payments' && <PaymentsPanel orders={orders} onRefresh={loadOrders} />}
          {tab === 'reports' && <ReportsPanel />}
          {tab === 'trucks' && <TrucksPanel />}
          {tab === 'menu' && <MenuPanel />}
          {tab === 'partnerships' && <PartnershipsPanel />}
          {tab === 'contact' && <ContactPanel />}
          {tab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  )
}
