import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../services/api'
import CustomerPageHeader from './CustomerPageHeader'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send the reset link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-sm mx-auto px-5 py-14">
        <h1 className="font-display font-bold text-2xl text-navy">Forgot Password?</h1>
        <p className="text-ink/60 text-sm mt-1">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-8 bg-lightgreen/60 rounded-2xl p-6 text-center">
            <p className="text-navy font-semibold text-sm">
              If an account exists for that email, we&apos;ve sent a password reset link.
            </p>
            <p className="text-ink/50 text-xs mt-2">
              Check your inbox (and spam folder) — the link expires in 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink/60 mt-6">
          <Link to="/login" className="text-green font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
