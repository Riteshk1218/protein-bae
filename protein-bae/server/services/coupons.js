import { db } from '../db.js'

/**
 * Validates a coupon code against a subtotal and returns the discount to
 * apply. Always recomputed here -- never trust a discount value sent from
 * the browser.
 *
 * @returns {{ valid: boolean, discount: number, message?: string, coupon?: object }}
 */
export function validateCoupon(code, subtotal) {
  if (!code) return { valid: false, discount: 0, message: 'No coupon code provided.' }

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.trim().toUpperCase())
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Coupon is invalid or expired.' }
  }
  if (!coupon.active) {
    return { valid: false, discount: 0, message: 'Coupon is invalid or expired.' }
  }

  const today = new Date().toISOString().slice(0, 10)
  if (coupon.start_date && today < coupon.start_date) {
    return { valid: false, discount: 0, message: 'Coupon is invalid or expired.' }
  }
  if (coupon.expiry_date && today > coupon.expiry_date) {
    return { valid: false, discount: 0, message: 'Coupon is invalid or expired.' }
  }

  if (subtotal < coupon.min_order) {
    return {
      valid: false,
      discount: 0,
      message: `This coupon needs a minimum order of \u20b9${coupon.min_order}.`,
    }
  }

  if (coupon.usage_limit != null) {
    const used = db.prepare('SELECT COUNT(*) AS n FROM coupon_usage WHERE coupon_id = ?').get(coupon.id).n
    if (used >= coupon.usage_limit) {
      return { valid: false, discount: 0, message: 'This coupon has reached its usage limit.' }
    }
  }

  let discount = coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : Math.round(coupon.value)
  discount = Math.max(0, Math.min(discount, subtotal))

  return { valid: true, discount, coupon }
}

export function recordCouponUsage(couponId, orderId) {
  db.prepare('INSERT INTO coupon_usage (coupon_id, order_id) VALUES (?, ?)').run(couponId, orderId)
}
