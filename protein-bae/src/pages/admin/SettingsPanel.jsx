import { useEffect, useState } from 'react'
import { Tag, Mail } from 'lucide-react'
import { getCoupons, createCoupon, setCouponActive, sendTestEmail } from '../../services/api'

export default function SettingsPanel() {
  const [coupons, setCoupons] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    expiryDate: '',
  })
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [testEmail, setTestEmail] = useState('')
  const [testStatus, setTestStatus] = useState(null) // null | 'sending' | 'sent' | { error }

  const load = () => {
    getCoupons()
      .then(setCoupons)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  const handleTestEmail = async (e) => {
    e.preventDefault()
    if (!testEmail.trim()) return
    setTestStatus('sending')
    try {
      await sendTestEmail(testEmail.trim())
      setTestStatus('sent')
    } catch (err) {
      setTestStatus({ error: err.message || 'Could not send the test email.' })
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.code.trim() || !form.value) {
      setFormError('Code and value are required.')
      return
    }
    setCreating(true)
    try {
      await createCoupon({
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        expiryDate: form.expiryDate || null,
      })
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', expiryDate: '' })
      load()
    } catch (err) {
      setFormError(err.message || 'Could not create coupon.')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await setCouponActive(coupon.id, !coupon.active)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="font-display font-bold text-lg text-navy mb-6">Settings</h2>

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <p className="font-display font-bold text-navy text-sm mb-3">Server Configuration</p>
        <p className="text-ink/60 text-sm leading-relaxed">
          Admin password, JWT secret and SMTP (order-email) credentials are set in{' '}
          <code className="bg-navy/5 px-1.5 py-0.5 rounded">server/.env</code> and are never exposed to
          this dashboard. Update that file and restart the server to change them.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <p className="font-display font-bold text-navy text-sm mb-3 inline-flex items-center gap-2">
          <Mail size={16} className="text-green" /> Test Order Emails
        </p>
        <p className="text-ink/60 text-sm mb-4">
          Send a real test email to check your SMTP setup in{' '}
          <code className="bg-navy/5 px-1.5 py-0.5 rounded">server/.env</code> without placing an order.
        </p>
        <form onSubmit={handleTestEmail} className="flex flex-wrap gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={testEmail}
            onChange={(e) => {
              setTestEmail(e.target.value)
              setTestStatus(null)
            }}
            className="flex-1 min-w-[200px] rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
          />
          <button
            type="submit"
            disabled={testStatus === 'sending'}
            className="bg-navy text-white text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-full hover:bg-navy-deep transition-colors disabled:opacity-60"
          >
            {testStatus === 'sending' ? 'Sending…' : 'Send Test Email'}
          </button>
        </form>
        {testStatus === 'sent' && (
          <p className="text-green text-sm mt-3">
            Sent! Check {testEmail}&apos;s inbox (and spam folder).
          </p>
        )}
        {testStatus?.error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm font-semibold">Failed to send:</p>
            <p className="text-red-600 text-sm mt-1">{testStatus.error}</p>
            <p className="text-red-500/70 text-xs mt-2">
              Most often this means SMTP_PASSWORD in server/.env isn&apos;t a Google App Password, or
              server/.env doesn&apos;t exist yet (copy it from server/.env.example and restart the server).
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <p className="font-display font-bold text-navy text-sm mb-4 inline-flex items-center gap-2">
          <Tag size={16} className="text-green" /> Coupons
        </p>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <ul className="divide-y divide-navy/8 mb-6">
          {coupons.length === 0 && <p className="text-ink/50 text-sm py-2">No coupons yet.</p>}
          {coupons.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-bold text-navy">{c.code}</p>
                <p className="text-ink/50 text-xs mt-0.5">
                  {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                  {c.min_order > 0 ? ` · min ₹${c.min_order}` : ''}
                  {c.expiry_date ? ` · expires ${c.expiry_date}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(c)}
                className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                  c.active ? 'bg-lightgreen text-green' : 'bg-navy/10 text-navy/50'
                }`}
              >
                {c.active ? 'Active' : 'Inactive'}
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Code, e.g. PROTEIN10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm uppercase focus:border-green outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
          <input
            type="number"
            placeholder={form.type === 'percentage' ? 'Value, e.g. 10 (%)' : 'Value, e.g. 50 (₹)'}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
          />
          <input
            type="number"
            placeholder="Minimum order (₹, optional)"
            value={form.minOrder}
            onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
          />
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
          />
          {formError && <p className="sm:col-span-2 text-red-600 text-xs">{formError}</p>}
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-2 bg-navy text-white text-xs font-bold uppercase tracking-wide py-3 rounded-full hover:bg-navy-deep transition-colors disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Create Coupon'}
          </button>
        </form>
      </div>
    </div>
  )
}
