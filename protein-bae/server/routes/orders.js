import { Router } from 'express'
import { db, ORDER_STATUSES } from '../db.js'
import { getMenuItemById } from '../services/menu.js'
import { requireAdmin } from '../middleware/auth.js'
import { optionalCustomer } from '../middleware/customerAuth.js'
import { validateCoupon, recordCouponUsage } from '../services/coupons.js'
import { getPaymentSummary } from '../services/payments.js'
import { sendOrderConfirmation, sendStatusUpdate } from '../services/email.js'
import { isValidPhone, PHONE_ERROR_MESSAGE } from '../services/phone.js'
import { isValidPickupTime } from '../services/pickup.js'
import { getActiveTruck } from '../services/trucks.js'
import { serializeOrder } from '../services/orderSerializer.js'

export const ordersRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function priceItems(items) {
  // Never trust prices from the client -- look each item up server-side.
  let subtotal = 0
  const priced = items.map(({ id, qty, customization }) => {
    const menuItem = getMenuItemById(id)
    if (!menuItem) throw new Error(`Unknown menu item: ${id}`)
    if (!menuItem.available) throw new Error(`${menuItem.name} is not available right now.`)
    const quantity = Math.max(1, Math.min(20, Number(qty) || 1))
    subtotal += menuItem.price * quantity
    // Customization (e.g. "No: Onion, Cheese") never changes price -- it's
    // a prep instruction only, capped so it can't be used to stuff huge
    // payloads into an order.
    const note = customization ? String(customization).trim().slice(0, 300) : ''
    return { id, name: menuItem.name, price: menuItem.price, qty: quantity, customization: note || undefined }
  })
  return { priced, subtotal }
}


/**
 * If a pickup time is given, it must fall inside the active truck's
 * (opens + 30min) .. (closes - 30min) window. No truck / no hours set on
 * the truck means pickup-time selection isn't available, so any submitted
 * time is rejected rather than silently accepted.
 */
function validatePickupTime(pickupTime, truck) {
  if (!pickupTime) return null // optional -- ASAP pickup
  if (!truck || !isValidPickupTime(pickupTime, truck.opens_at, truck.closes_at)) {
    return 'That pickup time is outside today\u2019s valid pickup window.'
  }
  return null
}

function createOrderRow({ customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode, source, customerId, truck }) {
  const { priced, subtotal } = priceItems(items)

  let discount = 0
  let appliedCoupon = null
  if (couponCode) {
    const result = validateCoupon(couponCode, subtotal)
    if (!result.valid) {
      const err = new Error(result.message || 'Coupon is invalid or expired.')
      err.status = 400
      throw err
    }
    discount = result.discount
    appliedCoupon = result.coupon
  }

  const total = Math.max(0, subtotal - discount)

  const stmt = db.prepare(`
    INSERT INTO orders (
      customer_name, customer_email, customer_phone, customer_id,
      items_json, subtotal, discount, coupon_code, total,
      pickup_time, notes, status, source, payment_status, truck_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, 'UNPAID', ?)
  `)
  const info = stmt.run(
    customerName,
    customerEmail || null,
    customerPhone || '',
    customerId || null,
    JSON.stringify(priced),
    subtotal,
    discount,
    appliedCoupon ? appliedCoupon.code : null,
    total,
    pickupTime || null,
    notes || null,
    source,
    truck ? truck.id : null
  )

  if (appliedCoupon) {
    recordCouponUsage(appliedCoupon.id, info.lastInsertRowid)
  }

  return db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid)
}

// POST /api/orders -- place an order (used by the customer-facing site)
ordersRouter.post('/', optionalCustomer, async (req, res) => {
  const { customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode } = req.body || {}

  if (!customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ error: 'Name, email and mobile number are required.' })
  }
  if (!EMAIL_RE.test(customerEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!isValidPhone(customerPhone)) {
    return res.status(400).json({ error: PHONE_ERROR_MESSAGE })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Add at least one item to the order.' })
  }

  const truck = getActiveTruck()
  const pickupError = validatePickupTime(pickupTime, truck)
  if (pickupError) {
    return res.status(400).json({ error: pickupError })
  }

  let order
  try {
    order = createOrderRow({
      customerName,
      customerEmail,
      customerPhone,
      items,
      pickupTime,
      notes,
      couponCode,
      source: 'customer',
      customerId: req.customerId,
      truck,
    })
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message })
  }

  const serialized = serializeOrder(order)

  // Email failures must never block order creation.
  let emailResult = { sent: false }
  try {
    emailResult = await sendOrderConfirmation(serialized)
    if (emailResult.sent) {
      db.prepare('UPDATE orders SET last_status_emailed = ? WHERE id = ?').run('received', order.id)
    }
  } catch {
    emailResult = { sent: false }
  }

  res.status(201).json({
    ...serialized,
    emailSent: emailResult.sent,
    emailWarning: emailResult.sent ? null : 'Order created successfully, but confirmation email could not be sent.',
  })
})

// GET /api/orders -- list all orders, newest first (admin only)
ordersRouter.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  res.json(rows.map(serializeOrder))
})

// GET /api/orders/:id -- full order detail incl. payments (admin only)
ordersRouter.get('/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found.' })
  const summary = getPaymentSummary(row.id, row.total)
  res.json({ ...serializeOrder(row), payments: summary.payments, paid: summary.paid, remaining: summary.remaining })
})

// POST /api/orders/manual -- admin creates a walk-up / phone order
ordersRouter.post('/manual', requireAdmin, (req, res) => {
  const { customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode } = req.body || {}

  if (!customerName) {
    return res.status(400).json({ error: 'Customer name is required.' })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Add at least one item to the order.' })
  }
  if (customerEmail && !EMAIL_RE.test(customerEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (customerPhone && !isValidPhone(customerPhone)) {
    return res.status(400).json({ error: PHONE_ERROR_MESSAGE })
  }

  const truck = getActiveTruck()
  const pickupError = validatePickupTime(pickupTime, truck)
  if (pickupError) {
    return res.status(400).json({ error: pickupError })
  }

  let order
  try {
    order = createOrderRow({
      customerName,
      customerEmail,
      customerPhone,
      items,
      pickupTime,
      notes,
      couponCode,
      source: 'admin',
      customerId: null,
      truck,
    })
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message })
  }

  res.status(201).json(serializeOrder(order))
})

// PATCH /api/orders/:id -- admin updates order status
ordersRouter.patch('/:id', requireAdmin, async (req, res) => {
  const { status } = req.body || {}
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` })
  }

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!existing) {
    return res.status(404).json({ error: 'Order not found.' })
  }

  // Selecting the same status again is a no-op -- no DB write, no email.
  if (existing.status === status) {
    return res.json(serializeOrder(existing))
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id)
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  const serialized = serializeOrder(order)

  let emailResult = { sent: false }
  if (existing.last_status_emailed !== status) {
    try {
      emailResult = await sendStatusUpdate(serialized, status)
      if (emailResult.sent) {
        db.prepare('UPDATE orders SET last_status_emailed = ? WHERE id = ?').run(status, order.id)
      }
    } catch {
      emailResult = { sent: false }
    }
  }

  res.json({ ...serialized, emailSent: emailResult.sent })
})
