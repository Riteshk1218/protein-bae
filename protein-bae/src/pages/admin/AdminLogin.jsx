import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { adminLogin, getAdminToken } from '../../services/api'
import logoMark from '../../assets/logo-mark.png'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (getAdminToken()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await adminLogin(password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <img src={logoMark} alt="Protein Bae" className="w-16 h-16 rounded-full object-cover" />
          <h1 className="font-display font-bold text-xl text-navy mt-4">Truck Admin</h1>
          <p className="text-ink/60 text-sm mt-1">Sign in to manage orders and today&apos;s location.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
              <input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-navy/15 pl-11 pr-4 py-3 text-sm focus:border-green outline-none"
                placeholder="••••••••"
              />
            </div>
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
      </div>
    </div>
  )
}
