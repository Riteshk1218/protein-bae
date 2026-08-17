import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { validateCoupon } from '../services/coupons.js'

export const couponsRouter = Router()

// POST /api/coupons/validate -- public, used at checkout
couponsRouter.post('/validate', (req, res) => {
  const { code, subtotal } = req.body || {}
  const numericSubtotal = Number(subtotal)
  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    return res.status(400).json({ error: 'A valid subtotal is required.' })
  }
  const result = validateCoupon(code, numericSubtotal)
  if (!result.valid) {
    return res.status(400).json({ valid: false, error: result.message })
  }
  res.json({ valid: true, discount: result.discount, code: result.coupon.code })
})

// GET /api/coupons -- admin: list all coupons
couponsRouter.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all()
  res.json(rows)
})

// POST /api/coupons -- admin: create a coupon
couponsRouter.post('/', requireAdmin, (req, res) => {
  const { code, type, value, minOrder, startDate, expiryDate, active, usageLimit } = req.body || {}

  if (!code || !type || value == null) {
    return res.status(400).json({ error: 'Code, type and value are required.' })
  }
  if (!['percentage', 'fixed'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "percentage" or "fixed".' })
  }
  const existing = db.prepare('SELECT id FROM coupons WHERE code = ?').get(code.trim().toUpperCase())
  if (existing) {
    return res.status(409).json({ error: 'A coupon with this code already exists.' })
  }

  const info = db
    .prepare(
      `INSERT INTO coupons (code, type, value, min_order, start_date, expiry_date, active, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      code.trim().toUpperCase(),
      type,
      Number(value),
      Number(minOrder) || 0,
      startDate || null,
      expiryDate || null,
      active === false ? 0 : 1,
      usageLimit != null ? Number(usageLimit) : null
    )

  res.status(201).json(db.prepare('SELECT * FROM coupons WHERE id = ?').get(info.lastInsertRowid))
})

// PATCH /api/coupons/:id -- admin: toggle active / edit
couponsRouter.patch('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM coupons WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Coupon not found.' })

  const { active } = req.body || {}
  if (active !== undefined) {
    db.prepare('UPDATE coupons SET active = ? WHERE id = ?').run(active ? 1 : 0, req.params.id)
  }
  res.json(db.prepare('SELECT * FROM coupons WHERE id = ?').get(req.params.id))
})
