import { Router } from 'express'
import { db, PAYMENT_METHODS } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { getPaymentSummary, syncOrderPaymentStatus } from '../services/payments.js'

export const paymentsRouter = Router()

// GET /api/orders/:id/payments -- list payments for an order (admin only)
paymentsRouter.get('/:id/payments', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found.' })
  const summary = getPaymentSummary(order.id, order.total)
  res.json({ orderTotal: order.total, ...summary })
})

// POST /api/orders/:id/payments -- record a payment against an order (admin only)
paymentsRouter.post('/:id/payments', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found.' })

  const { paymentMethod, amount, note } = req.body || {}
  const numericAmount = Math.round(Number(amount))

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` })
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Enter a valid payment amount.' })
  }

  // Backend is the only source of truth for how much is already paid.
  const { paid: alreadyPaid } = getPaymentSummary(order.id, order.total)
  const remaining = order.total - alreadyPaid

  if (numericAmount > remaining) {
    return res.status(400).json({ error: `Payment amount cannot exceed \u20b9${remaining}.` })
  }

  db.prepare(
    'INSERT INTO payments (order_id, payment_method, amount, created_by, note) VALUES (?, ?, ?, ?, ?)'
  ).run(order.id, paymentMethod, numericAmount, 'admin', note || null)

  const status = syncOrderPaymentStatus(order.id)
  const summary = getPaymentSummary(order.id, order.total)

  res.status(201).json({ orderTotal: order.total, paymentStatus: status, ...summary })
})
