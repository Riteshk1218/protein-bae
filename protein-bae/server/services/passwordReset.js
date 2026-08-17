import crypto from 'node:crypto'

const RESET_TOKEN_TTL_MINUTES = 30

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex') // sent to the user, never stored
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex') // only this is stored
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString()
  return { token, tokenHash, expiresAt }
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Simple in-memory fixed-window limiter -- fine for a single-instance
// deployment; swap for a shared store (Redis) if this ever runs behind
// multiple server processes.
const requestLog = new Map() // key -> [timestamps]

export function isRateLimited(key, { max = 3, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now()
  const timestamps = (requestLog.get(key) || []).filter((t) => now - t < windowMs)
  if (timestamps.length >= max) {
    requestLog.set(key, timestamps)
    return true
  }
  timestamps.push(now)
  requestLog.set(key, timestamps)
  return false
}
