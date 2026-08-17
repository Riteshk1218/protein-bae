// Exactly 10 digits, numbers only -- e.g. 9876543210.
const PHONE_RE = /^\d{10}$/

export const PHONE_ERROR_MESSAGE = 'Please enter a valid 10-digit mobile number.'

export function isValidPhone(phone) {
  return typeof phone === 'string' && PHONE_RE.test(phone.trim())
}
