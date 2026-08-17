import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import CustomerPageHeader from './CustomerPageHeader'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { login } = useCustomerAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/my-orders', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-sm mx-auto px-5 py-14">
        <h1 className="font-display font-bold text-2xl text-navy">Sign In</h1>
        <p className="text-ink/60 text-sm mt-1">Track orders and leave reviews.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-navy/70">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-green hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          New here?{' '}
          <Link to="/register" className="text-green font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
