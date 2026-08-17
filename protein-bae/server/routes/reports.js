import { Router } from 'express'
import { db, PAYMENT_METHODS } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { resolveRange } from '../services/dateRange.js'

export const reportsRouter = Router()

// GET /api/reports?filter=today|yesterday|week|month|custom&startDate=&endDate=
reportsRouter.get('/', requireAdmin, (req, res) => {
  const { filter = 'month', startDate, endDate } = req.query
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
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length

  const totalOrders = orders.length
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0)
  const unpaidAmount = orders
    .filter((o) => o.payment_status === 'UNPAID')
    .reduce((sum, o) => sum + o.total, 0)
  const partialPaymentAmount = orders
    .filter((o) => o.payment_status === 'PARTIAL')
    .reduce((sum, o) => sum + o.total, 0)

  const payments = db
    .prepare('SELECT * FROM payments WHERE created_at >= ? AND created_at < ?')
    .all(range.start, range.end)
  const revenueByMethod = Object.fromEntries(PAYMENT_METHODS.map((m) => [m, 0]))
  for (const p of payments) {
    revenueByMethod[p.payment_method] = (revenueByMethod[p.payment_method] || 0) + p.amount
  }

  // Best-selling products -- aggregate line items across non-cancelled orders in range.
  const productTotals = new Map()
  for (const order of nonCancelled) {
    const items = JSON.parse(order.items_json)
    for (const item of items) {
      const entry = productTotals.get(item.id) || { name: item.name, qty: 0, revenue: 0 }
      entry.qty += item.qty
      entry.revenue += item.qty * item.price
      productTotals.set(item.id, entry)
    }
  }
  const bestSellers = [...productTotals.values()].sort((a, b) => b.qty - a.qty)

  res.json({
    range: { filter, start: range.start, end: range.end },
    totalOrders,
    totalRevenue,
    cashRevenue: revenueByMethod['Cash'],
    upiRevenue: revenueByMethod['Google Pay / UPI'],
    phonePeRevenue: revenueByMethod['PhonePe'],
    cardRevenue: revenueByMethod['Card'],
    revenueByMethod,
    unpaidAmount,
    partialPaymentAmount,
    cancelledOrders,
    completedOrders,
    bestSellers,
  })
})
