import 'dotenv/config'
import express from 'express'


import cors from 'cors'
import { ordersRouter } from './routes/orders.js'
import { paymentsRouter } from './routes/payments.js'
import { reviewsRouter } from './routes/reviews.js'
import { truckRouter, trucksAdminRouter } from './routes/trucks.js'
import { adminRouter } from './routes/admin.js'
import { menuRouter } from './routes/menu.js'
import { customerAuthRouter } from './routes/customerAuth.js'
import { customerOrdersRouter, trackRouter } from './routes/customerOrders.js'
import { couponsRouter } from './routes/coupons.js'
import { dashboardRouter } from './routes/dashboard.js'
import { reportsRouter } from './routes/reports.js'
import { partnershipsRouter } from './routes/partnerships.js'
import { contactRouter } from './routes/contact.js'
import { verifySmtpOnStartup } from './services/email.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/orders', ordersRouter)
app.use('/api/orders', paymentsRouter) // /api/orders/:id/payments
app.use('/api/orders', reviewsRouter) // /api/orders/:id/review
app.use('/api/truck', truckRouter)
app.use('/api/admin/trucks', trucksAdminRouter)
app.use('/api/admin', adminRouter)
app.use('/api/menu', menuRouter)
app.use('/api/auth', customerAuthRouter)
app.use('/api/customer', customerOrdersRouter)
app.use('/api/track', trackRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/partnerships', partnershipsRouter)
app.use('/api/contact', contactRouter)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(PORT, () => {
  console.log(`Protein Bae API running on http://localhost:${PORT}`)
  verifySmtpOnStartup()
})
