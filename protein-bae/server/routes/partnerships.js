import { Router } from 'express'
import { db, PARTNERSHIP_TYPES, PARTNERSHIP_STATUSES } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { isValidPhone, PHONE_ERROR_MESSAGE } from '../services/phone.js'

export const partnershipsRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/partnerships -- public submission from the "Partner With Us" form
partnershipsRouter.post('/', (req, res) => {
  const { fullName, businessName, phone, email, partnershipType, location, message } = req.body || {}

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required.' })
  }
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: PHONE_ERROR_MESSAGE })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!partnershipType || !PARTNERSHIP_TYPES.includes(partnershipType)) {
    return res.status(400).json({ error: `Partnership type must be one of: ${PARTNERSHIP_TYPES.join(', ')}` })
  }

  const info = db
    .prepare(
      `INSERT INTO partnership_requests (full_name, business_name, phone, email, partnership_type, location, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(fullName.trim(), (businessName || '').trim() || null, phone, email.trim(), partnershipType, (location || '').trim() || null, (message || '').trim() || null)

  res.status(201).json(db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(info.lastInsertRowid))
})

// GET /api/partnerships -- admin: list all requests, newest first
partnershipsRouter.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM partnership_requests ORDER BY id DESC').all())
})

// PATCH /api/partnerships/:id -- admin: update status
partnershipsRouter.patch('/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {}
  if (!PARTNERSHIP_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${PARTNERSHIP_STATUSES.join(', ')}` })
  }
  const result = db.prepare('UPDATE partnership_requests SET status = ? WHERE id = ?').run(status, req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Partnership request not found.' })
  res.json(db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(req.params.id))
})
