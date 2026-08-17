import { Router } from 'express'
import { issueToken, checkPassword, requireAdmin } from '../middleware/auth.js'
import { sendTestEmail } from '../services/email.js'

export const adminRouter = Router()

// POST /api/admin/login -- exchange the admin password for a session token
adminRouter.post('/login', (req, res) => {
  const { password } = req.body || {}
  if (!checkPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }
  res.json({ token: issueToken() })
})

// POST /api/admin/test-email -- sends a real email and reports the exact
// success/failure reason, so SMTP problems can be diagnosed from the
// admin panel instead of digging through server console logs.
adminRouter.post('/test-email', requireAdmin, async (req, res) => {
  const { to } = req.body || {}
  if (!to) {
    return res.status(400).json({ error: 'Enter an email address to send the test to.' })
  }
  const result = await sendTestEmail(to)
  if (!result.sent) {
    return res.status(502).json({ error: result.reason || 'Could not send the test email.' })
  }
  res.json({ sent: true })
})
