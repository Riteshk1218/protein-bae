import { Router } from 'express'
import { db, CONTACT_STATUSES } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { isValidPhone, PHONE_ERROR_MESSAGE } from '../services/phone.js'

export const contactRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/contact -- public submission from the Contact Us form
contactRouter.post('/', (req, res) => {
  const { name, phone, email, subject, message } = req.body || {}

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: PHONE_ERROR_MESSAGE })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  const info = db
    .prepare('INSERT INTO contact_messages (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)')
    .run(name.trim(), phone, email.trim(), (subject || '').trim() || null, message.trim())

  res.status(201).json(db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(info.lastInsertRowid))
})

// GET /api/contact -- admin: list all messages, newest first
contactRouter.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all())
})

// PATCH /api/contact/:id -- admin: update status
contactRouter.patch('/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {}
  if (!CONTACT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${CONTACT_STATUSES.join(', ')}` })
  }
  const result = db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Message not found.' })
  res.json(db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id))
})
