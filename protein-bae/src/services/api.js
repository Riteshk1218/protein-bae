// -----------------------------------------------------------------------
// API service layer -- talks to the Protein Bae Express server in /server.
// Base URL comes from VITE_API_URL (see .env.example); defaults to the
// local dev server. `auth: 'admin'` attaches the admin session token,
// `auth: 'customer'` attaches the logged-in customer's token.
// -----------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const ADMIN_TOKEN_KEY = 'proteinbae_admin_token'
const CUSTOMER_TOKEN_KEY = 'proteinbae_customer_token'

async function request(path, { method = 'GET', body, auth } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth === 'admin') {
    const token = getAdminToken()
    if (token) headers.Authorization = `Bearer ${token}`
  } else if (auth === 'customer') {
    const token = getCustomerToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Could not reach the server. Is it running?')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }
  return data
}

/* ---------------- Public / customer-facing ---------------- */

/** GET /api/menu -- today's available menu items */
export function getMenu() {
  return request('/menu')
}

/** GET /api/truck -- today's truck location, hours and status */
export function getTodaysTruckLocation() {
  return request('/truck')
}

/** POST /api/orders -- place an order for pickup */
export function createOrder({ customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode }) {
  return request('/orders', {
    method: 'POST',
    auth: 'customer', // attaches the token if the shopper is logged in; harmless if not
    body: { customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode },
  })
}

/** POST /api/coupons/validate -- check a coupon against the current subtotal */
export function validateCoupon(code, subtotal) {
  return request('/coupons/validate', { method: 'POST', body: { code, subtotal } })
}

/** GET /api/track/:id?contact= -- guest order tracking by phone or email */
export function trackOrder(orderId, contact) {
  return request(`/track/${orderId}?contact=${encodeURIComponent(contact)}`)
}

/* ---------------- Customer accounts ---------------- */

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY)
}
function setCustomerToken(token) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token)
}
export function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY)
}

/** POST /api/auth/register */
export async function registerCustomer(payload) {
  const data = await request('/auth/register', { method: 'POST', body: payload })
  setCustomerToken(data.token)
  return data.customer
}

/** POST /api/auth/login */
export async function loginCustomer(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } })
  setCustomerToken(data.token)
  return data.customer
}

/** GET /api/auth/me */
export function getCurrentCustomer() {
  return request('/auth/me', { auth: 'customer' })
}

/** GET /api/customer/orders -- the logged-in customer's own orders */
export function getMyOrders() {
  return request('/customer/orders', { auth: 'customer' })
}

/** GET /api/customer/orders/:id -- detail for one of the customer's own orders */
export function getMyOrder(id) {
  return request(`/customer/orders/${id}`, { auth: 'customer' })
}

/** POST /api/orders/:id/review */
export function submitReview(orderId, rating, comment) {
  return request(`/orders/${orderId}/review`, { method: 'POST', auth: 'customer', body: { rating, comment } })
}

/* ---------------- Admin ---------------- */

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}
function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}
export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

/** POST /api/admin/login -- exchange the admin password for a session token */
export async function adminLogin(password) {
  const { token } = await request('/admin/login', { method: 'POST', body: { password } })
  setAdminToken(token)
  return token
}

/** POST /api/admin/test-email -- send a real test email, reports the exact SMTP error if it fails */
export function sendTestEmail(to) {
  return request('/admin/test-email', { method: 'POST', auth: 'admin', body: { to } })
}

/** GET /api/orders -- list all orders (admin only) */
export function getOrders() {
  return request('/orders', { auth: 'admin' })
}

/** GET /api/orders/:id -- full order detail incl. payments (admin only) */
export function getOrder(id) {
  return request(`/orders/${id}`, { auth: 'admin' })
}

/** POST /api/orders/manual -- admin creates a walk-up / phone order */
export function createManualOrder({ customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode }) {
  return request('/orders/manual', {
    method: 'POST',
    auth: 'admin',
    body: { customerName, customerEmail, customerPhone, items, pickupTime, notes, couponCode },
  })
}

/** PATCH /api/orders/:id -- admin updates order status */
export function updateOrderStatus(id, status) {
  return request(`/orders/${id}`, { method: 'PATCH', auth: 'admin', body: { status } })
}

/** GET /api/orders/:id/payments -- payment ledger for one order */
export function getOrderPayments(id) {
  return request(`/orders/${id}/payments`, { auth: 'admin' })
}

/** POST /api/orders/:id/payments -- record a payment against an order */
export function recordPayment(id, { paymentMethod, amount, note }) {
  return request(`/orders/${id}/payments`, {
    method: 'POST',
    auth: 'admin',
    body: { paymentMethod, amount, note },
  })
}

/** GET /api/dashboard -- admin overview stats */
export function getDashboard(filter, startDate, endDate) {
  const params = new URLSearchParams({ filter })
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  return request(`/dashboard?${params}`, { auth: 'admin' })
}

/** GET /api/reports -- admin sales reports */
export function getReports(filter, startDate, endDate) {
  const params = new URLSearchParams({ filter })
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  return request(`/reports?${params}`, { auth: 'admin' })
}

/** POST /api/menu -- admin: add a new product */
export function createMenuItem(payload) {
  return request('/menu', { method: 'POST', auth: 'admin', body: payload })
}

/** PUT /api/menu/:id -- admin: edit a product */
export function updateMenuItem(id, payload) {
  return request(`/menu/${id}`, { method: 'PUT', auth: 'admin', body: payload })
}

/** DELETE /api/menu/:id -- admin: remove a product */
export function deleteMenuItem(id) {
  return request(`/menu/${id}`, { method: 'DELETE', auth: 'admin' })
}

/** GET /api/coupons -- admin: list coupons */
export function getCoupons() {
  return request('/coupons', { auth: 'admin' })
}

/** POST /api/coupons -- admin: create a coupon */
export function createCoupon(payload) {
  return request('/coupons', { method: 'POST', auth: 'admin', body: payload })
}

/** PATCH /api/coupons/:id -- admin: toggle a coupon active/inactive */
export function setCouponActive(id, active) {
  return request(`/coupons/${id}`, { method: 'PATCH', auth: 'admin', body: { active } })
}

/* ---------------- Trucks ---------------- */

/** GET /api/admin/trucks -- admin: list every truck */
export function getTrucks() {
  return request('/admin/trucks', { auth: 'admin' })
}

/** POST /api/admin/trucks -- admin: add a truck */
export function createTruck(payload) {
  return request('/admin/trucks', { method: 'POST', auth: 'admin', body: payload })
}

/** PUT /api/admin/trucks/:id -- admin: edit a truck (pass active: true to make it the featured truck) */
export function updateTruck(id, payload) {
  return request(`/admin/trucks/${id}`, { method: 'PUT', auth: 'admin', body: payload })
}

/** DELETE /api/admin/trucks/:id -- admin: remove a truck */
export function deleteTruck(id) {
  return request(`/admin/trucks/${id}`, { method: 'DELETE', auth: 'admin' })
}

/* ---------------- Partnerships ---------------- */

/** POST /api/partnerships -- public: submit a "Partner With Us" request */
export function submitPartnershipRequest(payload) {
  return request('/partnerships', { method: 'POST', body: payload })
}

/** GET /api/partnerships -- admin: list all requests */
export function getPartnershipRequests() {
  return request('/partnerships', { auth: 'admin' })
}

/** PATCH /api/partnerships/:id -- admin: update status */
export function updatePartnershipStatus(id, status) {
  return request(`/partnerships/${id}`, { method: 'PATCH', auth: 'admin', body: { status } })
}

/* ---------------- Contact ---------------- */

/** POST /api/contact -- public: submit the Contact Us form */
export function submitContactMessage(payload) {
  return request('/contact', { method: 'POST', body: payload })
}

/** GET /api/contact -- admin: list all messages */
export function getContactMessages() {
  return request('/contact', { auth: 'admin' })
}

/** PATCH /api/contact/:id -- admin: update status */
export function updateContactStatus(id, status) {
  return request(`/contact/${id}`, { method: 'PATCH', auth: 'admin', body: { status } })
}

/* ---------------- Password reset ---------------- */

/** POST /api/auth/forgot-password */
export function forgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } })
}

/** POST /api/auth/reset-password */
export function resetPassword(token, password, confirmPassword) {
  return request('/auth/reset-password', { method: 'POST', body: { token, password, confirmPassword } })
}
