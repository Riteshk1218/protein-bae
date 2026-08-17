import { useEffect, useState } from 'react'
import { Mail, Phone, Building2 } from 'lucide-react'
import { getPartnershipRequests, updatePartnershipStatus } from '../../services/api'

const STATUSES = ['New', 'Contacted', 'Closed']
const STATUS_TONE = {
  New: 'bg-yellow/20 text-yellow-deep',
  Contacted: 'bg-navy/10 text-navy',
  Closed: 'bg-lightgreen text-green',
}

export default function PartnershipsPanel() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    getPartnershipRequests()
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const changeStatus = async (id, status) => {
    const previous = requests
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await updatePartnershipStatus(id, status)
    } catch (err) {
      setRequests(previous)
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="font-display font-bold text-lg text-navy mb-6">Partnership Requests</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}
      {!loading && requests.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-ink/60 text-sm">No partnership requests yet.</p>
        </div>
      )}

      <ul className="space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold text-navy">{r.full_name}</p>
                {r.business_name && (
                  <p className="inline-flex items-center gap-1.5 text-ink/60 text-sm mt-1">
                    <Building2 size={13} /> {r.business_name}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink/50">
                  <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-green">
                    <Phone size={12} /> {r.phone}
                  </a>
                  <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-green">
                    <Mail size={12} /> {r.email}
                  </a>
                  <span>{r.created_at}</span>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide bg-navy/5 text-navy/70 px-3 py-1.5 rounded-full">
                {r.partnership_type}
              </span>
            </div>

            {r.location && <p className="text-ink/60 text-sm mt-3">📍 {r.location}</p>}
            {r.message && <p className="text-ink/70 text-sm mt-2 bg-lightgreen/50 rounded-lg px-3 py-2">{r.message}</p>}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-navy/8">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeStatus(r.id, s)}
                  className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                    r.status === s ? STATUS_TONE[s] : 'bg-navy/5 text-navy/40 hover:text-navy'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
