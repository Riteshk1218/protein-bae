import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/api'
import DateRangeFilter from './DateRangeFilter'

function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-navy',
    green: 'text-green',
    yellow: 'text-yellow-deep',
    red: 'text-red-500',
  }
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <p className="text-ink/50 text-xs font-bold uppercase tracking-wide">{label}</p>
      <p className={`font-display font-extrabold text-2xl mt-2 ${tones[tone]}`}>{value}</p>
    </div>
  )
}

export default function DashboardPanel() {
  const [filter, setFilter] = useState('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (filter === 'custom' && (!startDate || !endDate)) return
    setLoading(true)
    getDashboard(filter, startDate, endDate)
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [filter, startDate, endDate])

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="font-display font-bold text-lg text-navy">Dashboard</h2>
        <DateRangeFilter
          filter={filter}
          onFilterChange={setFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}

      {data && !loading && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Orders" value={data.todaysOrders} />
            <StatCard label="Revenue" value={`₹${data.todaysRevenue}`} tone="green" />
            <StatCard label="Pending Orders" value={data.pendingOrders} tone="yellow" />
            <StatCard label="Completed Orders" value={data.completedOrders} />
            <StatCard label="Unpaid Orders" value={data.unpaidOrders} tone="red" />
            <StatCard label="Partial Payments" value={data.partialPayments} tone="yellow" />
            <StatCard label="Cancelled Orders" value={data.cancelledOrders} />
            <StatCard label="Total Collected" value={`₹${data.totalCollected}`} tone="green" />
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 mt-6">
            <p className="font-display font-bold text-navy mb-4">Collection by Payment Method</p>
            <ul className="divide-y divide-navy/8">
              {Object.entries(data.collectionByMethod).map(([method, amount]) => (
                <li key={method} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink/70">{method}</span>
                  <span className="font-semibold text-navy">₹{amount}</span>
                </li>
              ))}
              <li className="flex items-center justify-between py-2.5 text-sm font-display font-extrabold text-navy">
                <span>Total</span>
                <span>₹{data.totalCollected}</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
