import { Router } from 'express'
import { db } from '../db.js'
import { requireCustomer } from '../middleware/customerAuth.js'
import { getPaymentSummary } from '../services/payments.js'
import { serializeOrder } from '../services/orderSerializer.js'

export const customerOrdersRouter = Router()

// GET /api/customer/orders -- the logged-in customer's own orders
customerOrdersRouter.get('/orders', requireCustomer, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC')
    .all(req.customerId)
  res.json(rows.map(serializeOrder))
})

// GET /api/customer/orders/:id -- detail for one of the customer's own orders
customerOrdersRouter.get('/orders/:id', requireCustomer, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row || row.customer_id !== req.customerId) {
    return res.status(404).json({ error: 'Order not found.' })
  }
  const summary = getPaymentSummary(row.id, row.total)
  const review = db.prepare('SELECT * FROM reviews WHERE order_id = ?').get(row.id)
  res.json({
    ...serializeOrder(row),
    paid: summary.paid,
    remaining: summary.remaining,
    canReview: row.status === 'completed' && !review,
    review: review || null,
  })
})

// GET /api/track/:id -- lightweight public tracking (order number + phone/email match)
// Lets a guest customer track an order without an account, without leaking
// other customers' orders: they must supply the phone or email on file.
export const trackRouter = Router()
trackRouter.get('/:id', (req, res) => {
  const { contact } = req.query
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found.' })

  const matches =
    contact &&
    (row.customer_phone === contact || (row.customer_email && row.customer_email.toLowerCase() === String(contact).toLowerCase()))

  if (!matches) {
    return res.status(403).json({ error: 'Enter the phone or email used for this order to track it.' })
  }

  res.json(serializeOrder(row))
})
