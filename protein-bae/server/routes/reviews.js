import { Router } from 'express'
import { db } from '../db.js'
import { requireCustomer } from '../middleware/customerAuth.js'

export const reviewsRouter = Router()

// POST /api/orders/:id/review
reviewsRouter.post('/:id/review', requireCustomer, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order || order.customer_id !== req.customerId) {
    return res.status(404).json({ error: 'Order not found.' })
  }
  if (order.status !== 'completed') {
    return res.status(400).json({ error: 'Only completed orders can be reviewed.' })
  }

  const existing = db.prepare('SELECT id FROM reviews WHERE order_id = ?').get(order.id)
  if (existing) {
    return res.status(409).json({ error: 'You already reviewed this order.' })
  }

  const { rating, comment } = req.body || {}
  const numericRating = Number(rating)
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' })
  }

  const info = db
    .prepare('INSERT INTO reviews (order_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(order.id, req.customerId, numericRating, comment || null)

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(review)
})
