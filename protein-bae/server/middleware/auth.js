import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'proteinbae2026'

export function issueToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' })
}

export function checkPassword(password) {
  return password === ADMIN_PASSWORD
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing admin token.' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid or expired admin session.' })
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin session.' })
  }
}
