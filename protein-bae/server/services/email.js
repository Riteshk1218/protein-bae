import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER

let transporter = null
let configWarningShown = false

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    if (!configWarningShown) {
      console.warn(
        '[email] SMTP is not configured (see server/.env.example) -- emails will be skipped, orders still work.'
      )
      configWarningShown = true
    }
    return null
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  }
  return transporter
}

function money(n) {
  return `\u20b9${n}`
}

function itemsAsText(items) {
  return items
    .map((i) => {
      const line = `${i.name} x ${i.qty}    ${money(i.price * i.qty)}`
      return i.customization ? `${line}\n    (${i.customization})` : line
    })
    .join('\n')
}

function itemsAsHtml(items) {
  return items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;color:#17213B;">
          ${i.name} &times; ${i.qty}
          ${i.customization ? `<br/><span style="color:#17213B99;font-size:12px;">(${i.customization})</span>` : ''}
        </td>
        <td style="padding:6px 0;text-align:right;color:#17213B;vertical-align:top;">${money(i.price * i.qty)}</td>
      </tr>`
    )
    .join('')
}

function wrapHtml({ heading, intro, order, extraLine }) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:480px; margin:0 auto; padding:32px 24px; color:#17213B;">
    <p style="color:#087334; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; font-size:12px; margin:0 0 12px;">Protein Bae</p>
    <h1 style="font-size:20px; margin:0 0 16px;">${heading}</h1>
    <p style="margin:0 0 16px; line-height:1.6;">${intro}</p>
    ${extraLine ? `<p style="margin:0 0 16px; font-weight:700; color:#087334;">${extraLine}</p>` : ''}
    <p style="font-weight:700; margin:0 0 8px;">Order #${order.id}</p>
    <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
      ${itemsAsHtml(order.items)}
    </table>
    <div style="border-top:1px solid #17213B22; padding-top:12px; display:flex; justify-content:space-between; font-weight:800;">
      Total: ${money(order.total)}
    </div>
    <p style="margin-top:24px; color:#17213B99; font-size:13px;">Thank you,<br/>Protein Bae</p>
  </div>`
}

export function verifySmtpOnStartup() {
  const t = getTransporter()
  if (!t) return // getTransporter() already logs the "not configured" warning
  t.verify((err) => {
    if (err) {
      console.error(
        '[email] SMTP connection failed -- emails will NOT send until this is fixed:',
        err.message
      )
      console.error(
        '[email] Common causes: SMTP_PASSWORD is your regular Gmail password instead of a Google App Password, ' +
          '2-Step Verification is off on the Gmail account, or SMTP_USER/FROM_EMAIL is wrong. ' +
          'See https://myaccount.google.com/apppasswords'
      )
    } else {
      console.log(`[email] SMTP connected -- ready to send as ${FROM_EMAIL}`)
    }
  })
}

async function send({ to, subject, text, html }) {
  const t = getTransporter()
  if (!t) return { sent: false, reason: 'SMTP not configured' }
  try {
    await t.sendMail({ from: `Protein Bae <${FROM_EMAIL}>`, to, subject, text, html })
    return { sent: true }
  } catch (err) {
    // Email failures must never block order creation / status updates.
    console.error('[email] send failed:', err.message)
    return { sent: false, reason: err.message }
  }
}

export async function sendTestEmail(to) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return { sent: false, reason: 'SMTP is not configured in server/.env (SMTP_HOST/SMTP_USER/SMTP_PASSWORD missing).' }
  }
  return send({
    to,
    subject: 'Protein Bae — Test Email',
    text: 'This is a test email from your Protein Bae admin panel. If you got this, SMTP is working correctly.',
    html: `<div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:480px; margin:0 auto; padding:32px 24px; color:#17213B;">
      <p style="color:#087334; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; font-size:12px; margin:0 0 12px;">Protein Bae</p>
      <h1 style="font-size:20px; margin:0 0 16px;">Test Email</h1>
      <p style="line-height:1.6;">This is a test email from your Protein Bae admin panel. If you got this, SMTP is working correctly.</p>
    </div>`,
  })
}

export async function sendOrderConfirmation(order) {
  if (!order.customer_email) return { sent: false, reason: 'No customer email on file' }

  const text = `Hi ${order.customer_name},

Thank you for ordering from Protein Bae!

Your order has been confirmed.

Order #${order.id}

Items:
${itemsAsText(order.items)}

Total: ${money(order.total)}

Order Status:
Received

Thank you,
Protein Bae`

  const html = wrapHtml({
    heading: `Hi ${order.customer_name},`,
    intro: 'Thank you for ordering from Protein Bae! Your order has been confirmed.',
    order,
  })

  return send({
    to: order.customer_email,
    subject: `Protein Bae — Order #${order.id} Confirmed`,
    text,
    html,
  })
}

const STATUS_MESSAGES = {
  received: 'Your Protein Bae order has been received.',
  preparing: 'Your Protein Bae order is being prepared.',
  ready: 'Your Protein Bae order is ready!',
  completed: 'Thank you for ordering from Protein Bae.',
  cancelled: 'Your Protein Bae order has been cancelled.',
}

export async function sendStatusUpdate(order, status) {
  if (!order.customer_email) return { sent: false, reason: 'No customer email on file' }
  const message = STATUS_MESSAGES[status]
  if (!message) return { sent: false, reason: `No email copy for status "${status}"` }

  const text = `Hi ${order.customer_name},

${message}

Order #${order.id}

Items:
${itemsAsText(order.items)}

Total: ${money(order.total)}

Order Status:
${status[0].toUpperCase() + status.slice(1)}

Thank you,
Protein Bae`

  const html = wrapHtml({
    heading: `Hi ${order.customer_name},`,
    intro: message,
    order,
  })

  return send({
    to: order.customer_email,
    subject: `Protein Bae — Order #${order.id} ${status[0].toUpperCase() + status.slice(1)}`,
    text,
    html,
  })
}

export async function sendPasswordResetEmail(customer, resetUrl) {
  const text = `Hi ${customer.name},

We received a request to reset your Protein Bae password.

Reset your password here (this link expires in 30 minutes and can only be used once):
${resetUrl}

If you didn't request this, you can safely ignore this email -- your password hasn't been changed.

Thank you,
Protein Bae`

  const html = `<div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:480px; margin:0 auto; padding:32px 24px; color:#17213B;">
    <p style="color:#087334; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; font-size:12px; margin:0 0 12px;">Protein Bae</p>
    <h1 style="font-size:20px; margin:0 0 16px;">Reset your password</h1>
    <p style="margin:0 0 20px; line-height:1.6;">
      We received a request to reset your Protein Bae password. This link expires in
      30 minutes and can only be used once.
    </p>
    <a href="${resetUrl}" style="display:inline-block; background:#F2C21A; color:#0F1D47; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:999px; font-size:14px;">
      Reset Password
    </a>
    <p style="margin-top:24px; color:#17213B99; font-size:13px; line-height:1.6;">
      If you didn't request this, you can safely ignore this email -- your password
      hasn't been changed.
    </p>
    <p style="margin-top:16px; color:#17213B99; font-size:13px;">Thank you,<br/>Protein Bae</p>
  </div>`

  return send({
    to: customer.email,
    subject: 'Protein Bae — Reset Your Password',
    text,
    html,
  })
}
