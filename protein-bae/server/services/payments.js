import { db } from '../db.js'

/**
 * Computes paid/remaining/status for an order purely from the payments
 * table -- never trusts a total sent from the browser.
 */
export function getPaymentSummary(orderId, orderTotal) {
  const payments = db
    .prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id ASC')
    .all(orderId)
  const paid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, orderTotal - paid)

  let status
  if (paid <= 0) status = 'UNPAID'
  else if (paid >= orderTotal) status = 'PAID'
  else status = 'PARTIAL'

  return { payments, paid, remaining, status }
}

/** Recomputes and persists payment_status on the order row after any payment change. */
export function syncOrderPaymentStatus(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
  if (!order) return null
  const { status } = getPaymentSummary(orderId, order.total)
  db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(status, orderId)
  return status
}
