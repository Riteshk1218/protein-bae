import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { issueCustomerToken, requireCustomer } from '../middleware/customerAuth.js'
import { isValidPhone, PHONE_ERROR_MESSAGE } from '../services/phone.js'
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from '../services/password.js'
import { generateResetToken, hashToken, isRateLimited } from '../services/passwordReset.js'
import { sendPasswordResetEmail } from '../services/email.js'

export const customerAuthRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

function publicCustomer(row) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone }
}

// POST /api/auth/register
customerAuthRouter.post('/register', async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body || {}

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Name, email and password are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: PHONE_ERROR_MESSAGE })
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: PASSWORD_REQUIREMENTS_MESSAGE })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' })
  }

  const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const info = db
    .prepare('INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
    .run(name, email.toLowerCase(), phone || null, passwordHash)

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid)
  const token = issueCustomerToken(customer)
  res.status(201).json({ token, customer: publicCustomer(customer) })
})

// POST /api/auth/login
customerAuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase())
  if (!customer) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  const ok = await bcrypt.compare(password, customer.password_hash)
  if (!ok) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  const token = issueCustomerToken(customer)
  res.json({ token, customer: publicCustomer(customer) })
})

// GET /api/auth/me -- current customer profile
customerAuthRouter.get('/me', requireCustomer, (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customerId)
  if (!customer) return res.status(404).json({ error: 'Account not found.' })
  res.json(publicCustomer(customer))
})

// POST /api/auth/forgot-password -- always responds the same way, whether
// or not the email exists, so account existence can't be enumerated.
const GENERIC_FORGOT_MESSAGE = "If an account exists for that email, we've sent a password reset link."

customerAuthRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {}
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  const limitKey = `forgot:${email.toLowerCase()}:${req.ip}`
  if (isRateLimited(limitKey, { max: 3, windowMs: 15 * 60 * 1000 })) {
    // Still generic -- don't reveal whether the rate limit or the lookup is why.
    return res.json({ message: GENERIC_FORGOT_MESSAGE })
  }

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase())
  if (customer) {
    const { token, tokenHash, expiresAt } = generateResetToken()
    db.prepare('INSERT INTO password_reset_tokens (customer_id, token_hash, expires_at) VALUES (?, ?, ?)').run(
      customer.id,
      tokenHash,
      expiresAt
    )
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`
    try {
      await sendPasswordResetEmail(customer, resetUrl)
    } catch {
      // Never reveal email failures here either -- same generic response either way.
    }
  }

  res.json({ message: GENERIC_FORGOT_MESSAGE })
})

// POST /api/auth/reset-password
customerAuthRouter.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body || {}
  const invalidMessage = 'This password reset link is invalid or has expired.'

  if (!token) {
    return res.status(400).json({ error: invalidMessage })
  }

  const tokenHash = hashToken(token)
  const row = db
    .prepare(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')`
    )
    .get(tokenHash)

  if (!row) {
    return res.status(400).json({ error: invalidMessage })
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: PASSWORD_REQUIREMENTS_MESSAGE })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const applyReset = db.transaction(() => {
    db.prepare('UPDATE customers SET password_hash = ? WHERE id = ?').run(passwordHash, row.customer_id)
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id)
    // Invalidate any other outstanding reset links for this customer too.
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE customer_id = ? AND id != ?').run(row.customer_id, row.id)
  })
  applyReset()

  res.json({ message: 'Password Reset Successfully' })
})
