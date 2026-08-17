import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { submitPartnershipRequest } from '../services/api'

const PARTNERSHIP_TYPES = [
  'Gym',
  'Yoga Centre',
  'Sports Club',
  'Corporate Office',
  'Residential Community',
  'Fitness Event',
  'Other',
]

const PHONE_RE = /^\d{10}$/

export default function PartnershipFormModal({ onClose }) {
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    partnershipType: PARTNERSHIP_TYPES[0],
    location: '',
    message: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!PHONE_RE.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setSubmitting(true)
    try {
      await submitPartnershipRequest({
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim() || undefined,
        phone: form.phone.trim(),
        email: form.email.trim(),
        partnershipType: form.partnershipType,
        location: form.location.trim() || undefined,
        message: form.message.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[24px] shadow-2xl p-6 md:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 text-navy/50 hover:text-navy">
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-10">
            <CheckCircle2 size={48} className="text-green mx-auto" />
            <h3 className="font-display font-bold text-xl text-navy mt-4">Request Sent!</h3>
            <p className="text-ink/60 text-sm mt-2 max-w-xs mx-auto">
              Thanks for reaching out — our team will get back to you shortly about partnering with Protein Bae.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-navy text-white font-bold text-sm uppercase tracking-wide px-8 py-3.5 rounded-full hover:bg-navy-deep transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-xl text-navy">Partner With Us</h2>
            <p className="text-ink/60 text-sm mt-1">Tell us about your community and we&apos;ll be in touch.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
              <input
                type="text"
                placeholder="Business / Organization (optional)"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Phone (10 digits)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
                />
              </div>
              <select
                value={form.partnershipType}
                onChange={(e) => setForm({ ...form, partnershipType: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              >
                {PARTNERSHIP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
              <textarea
                rows={3}
                placeholder="Message (optional)"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none resize-none"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-4 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
