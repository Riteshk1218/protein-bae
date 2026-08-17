import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me'

export function issueCustomerToken(customer) {
  return jwt.sign({ role: 'customer', customerId: customer.id }, JWT_SECRET, { expiresIn: '30d' })
}

function readToken(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'customer') return null
    return payload
  } catch {
    return null
  }
}

/** Requires a valid customer session; 401s otherwise. */
export function requireCustomer(req, res, next) {
  const payload = readToken(req)
  if (!payload) {
    return res.status(401).json({ error: 'Please sign in to continue.' })
  }
  req.customerId = payload.customerId
  next()
}

/** Attaches req.customerId if a valid customer token is present, but never blocks the request. */
export function optionalCustomer(req, res, next) {
  const payload = readToken(req)
  req.customerId = payload?.customerId || null
  next()
}
