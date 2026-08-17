import { useEffect, useState } from 'react'
import { getReports } from '../../services/api'
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

export default function ReportsPanel() {
  const [filter, setFilter] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (filter === 'custom' && (!startDate || !endDate)) return
    setLoading(true)
    getReports(filter, startDate, endDate)
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
        <h2 className="font-display font-bold text-lg text-navy">Reports</h2>
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
            <StatCard label="Total Orders" value={data.totalOrders} />
            <StatCard label="Total Revenue" value={`₹${data.totalRevenue}`} tone="green" />
            <StatCard label="Completed Orders" value={data.completedOrders} />
            <StatCard label="Cancelled Orders" value={data.cancelledOrders} tone="red" />
            <StatCard label="Unpaid Amount" value={`₹${data.unpaidAmount}`} tone="red" />
            <StatCard label="Partial Payment Amount" value={`₹${data.partialPaymentAmount}`} tone="yellow" />
            <StatCard label="Cash Revenue" value={`₹${data.cashRevenue}`} />
            <StatCard label="Google Pay / UPI Revenue" value={`₹${data.upiRevenue}`} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <p className="font-display font-bold text-navy mb-4">Revenue by Payment Method</p>
              <ul className="divide-y divide-navy/8">
                {Object.entries(data.revenueByMethod).map(([method, amount]) => (
                  <li key={method} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink/70">{method}</span>
                    <span className="font-semibold text-navy">₹{amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <p className="font-display font-bold text-navy mb-4">Best Selling Products</p>
              {data.bestSellers.length === 0 ? (
                <p className="text-ink/50 text-sm">No sales in this range yet.</p>
              ) : (
                <ul className="divide-y divide-navy/8">
                  {data.bestSellers.map((p) => (
                    <li key={p.name} className="py-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-navy">{p.name}</span>
                        <span className="text-ink/60">₹{p.revenue}</span>
                      </div>
                      <p className="text-ink/40 text-xs mt-0.5">{p.qty} sold</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
