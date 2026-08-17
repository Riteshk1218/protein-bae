import { useEffect, useState } from 'react'
import { Mail, Phone } from 'lucide-react'
import { getContactMessages, updateContactStatus } from '../../services/api'

const STATUSES = ['New', 'Read', 'Replied', 'Closed']
const STATUS_TONE = {
  New: 'bg-yellow/20 text-yellow-deep',
  Read: 'bg-navy/10 text-navy',
  Replied: 'bg-lightgreen text-green',
  Closed: 'bg-navy/5 text-navy/50',
}

export default function ContactPanel() {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    getContactMessages()
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const changeStatus = async (id, status) => {
    const previous = messages
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      await updateContactStatus(id, status)
    } catch (err) {
      setMessages(previous)
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="font-display font-bold text-lg text-navy mb-6">Contact Messages</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}
      {!loading && messages.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-ink/60 text-sm">No messages yet.</p>
        </div>
      )}

      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold text-navy">{m.name}</p>
                {m.subject && <p className="text-ink/70 text-sm mt-0.5">{m.subject}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink/50">
                  <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-green">
                    <Phone size={12} /> {m.phone}
                  </a>
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-green">
                    <Mail size={12} /> {m.email}
                  </a>
                  <span>{m.created_at}</span>
                </div>
              </div>
            </div>

            <p className="text-ink/70 text-sm mt-3 bg-lightgreen/50 rounded-lg px-3 py-2">{m.message}</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-navy/8">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeStatus(m.id, s)}
                  className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                    m.status === s ? STATUS_TONE[s] : 'bg-navy/5 text-navy/40 hover:text-navy'
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
