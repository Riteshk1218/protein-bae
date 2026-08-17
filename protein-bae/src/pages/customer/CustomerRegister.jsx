import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import CustomerPageHeader from './CustomerPageHeader'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const { register } = useCustomerAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      navigate('/my-orders', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (id, label, type = 'text', required = true) => (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[id]}
        onChange={(e) =>
          setForm({ ...form, [id]: id === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value })
        }
        className="w-full rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-sm mx-auto px-5 py-14">
        <h1 className="font-display font-bold text-2xl text-navy">Create Account</h1>
        <p className="text-ink/60 text-sm mt-1">Faster checkout, order tracking and reviews.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {field('name', 'Full Name')}
          {field('email', 'Email', 'email')}
          {field('phone', 'Mobile Number (10 digits, optional)', 'tel', false)}
          {field('password', 'Password', 'password')}
          <p className="text-ink/40 text-xs -mt-2">
            At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
          </p>
          {field('confirmPassword', 'Confirm Password', 'password')}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
