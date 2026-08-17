import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../services/api'
import CustomerPageHeader from './CustomerPageHeader'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('This password reset link is invalid or has expired.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(token, password, confirmPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || 'Could not reset your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-sm mx-auto px-5 py-14">
        <h1 className="font-display font-bold text-2xl text-navy">Reset Password</h1>

        {success ? (
          <div className="mt-8 bg-lightgreen/60 rounded-2xl p-6 text-center">
            <p className="text-navy font-semibold text-sm">Password Reset Successfully</p>
            <p className="text-ink/50 text-xs mt-2">Taking you to sign in…</p>
          </div>
        ) : !token ? (
          <div className="mt-8">
            <p className="text-red-600 text-sm">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="inline-block mt-4 text-green font-semibold text-sm">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
              <p className="text-ink/40 text-xs mt-1">
                At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
            >
              {submitting ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
