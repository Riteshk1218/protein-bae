import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { getMyOrder, trackOrder } from '../../services/api'
import CustomerPageHeader from './CustomerPageHeader'
import OrderSummaryCard from '../../components/ui/OrderSummaryCard'

export default function TrackOrder() {
  const { id } = useParams()
  const { customer, loading: authLoading } = useCustomerAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsContact, setNeedsContact] = useState(false)
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (customer) {
      // Try the authenticated route first -- works only if this order is theirs.
      getMyOrder(id)
        .then((data) => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => {
          setNeedsContact(true)
          setLoading(false)
        })
    } else {
      setNeedsContact(true)
      setLoading(false)
    }
  }, [id, customer, authLoading])

  const handleLookup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await trackOrder(id, contact.trim())
      setOrder(data)
      setNeedsContact(false)
    } catch (err) {
      setError(err.message || 'Could not find that order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-lg mx-auto px-5 py-10">
        <h1 className="font-display font-bold text-2xl text-navy">Track Order #{id}</h1>

        {loading && <p className="text-ink/50 text-sm mt-8">Loading…</p>}

        {!loading && needsContact && !order && (
          <form onSubmit={handleLookup} className="mt-8 bg-white rounded-2xl shadow-card p-6">
            <label htmlFor="contact" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Phone or Email Used for This Order
            </label>
            <input
              id="contact"
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              placeholder="e.g. 98765 43210 or you@example.com"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="mt-4 w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors"
            >
              Track Order
            </button>
          </form>
        )}

        {order && (
          <div className="mt-8">
            <OrderSummaryCard order={order} />
          </div>
        )}
      </div>
    </div>
  )
}
