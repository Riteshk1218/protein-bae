import { Router } from 'express'
import { db, PAYMENT_METHODS } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { resolveRange } from '../services/dateRange.js'

export const dashboardRouter = Router()

// GET /api/dashboard?filter=today|yesterday|week|month|custom&startDate=&endDate=
dashboardRouter.get('/', requireAdmin, (req, res) => {
  const { filter = 'today', startDate, endDate } = req.query
  let range
  try {
    range = resolveRange(filter, startDate, endDate)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }

  const orders = db
    .prepare('SELECT * FROM orders WHERE created_at >= ? AND created_at < ?')
    .all(range.start, range.end)

  const nonCancelled = orders.filter((o) => o.status !== 'cancelled')

  const todaysOrders = orders.length
  const todaysRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => ['received', 'preparing', 'ready'].includes(o.status)).length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length
  const unpaidOrders = orders.filter((o) => o.payment_status === 'UNPAID').length
  const partialPayments = orders.filter((o) => o.payment_status === 'PARTIAL').length

  const payments = db
    .prepare('SELECT * FROM payments WHERE created_at >= ? AND created_at < ?')
    .all(range.start, range.end)

  const collectionByMethod = Object.fromEntries(PAYMENT_METHODS.map((m) => [m, 0]))
  for (const p of payments) {
    collectionByMethod[p.payment_method] = (collectionByMethod[p.payment_method] || 0) + p.amount
  }
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  res.json({
    range: { filter, start: range.start, end: range.end },
    todaysOrders,
    todaysRevenue,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    unpaidOrders,
    partialPayments,
    collectionByMethod,
    totalCollected,
  })
})
