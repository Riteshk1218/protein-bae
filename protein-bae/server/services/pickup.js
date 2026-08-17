// Parses "10:00 AM" / "8:00 PM" style labels into minutes since midnight,
// and back again. Used to generate valid pickup slots and to validate a
// submitted pickup time server-side (never trust the frontend's slot list).

const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i

export function parseTimeToMinutes(label) {
  if (!label) return null
  const match = String(label).trim().match(TIME_RE)
  if (!match) return null
  let [, hours, minutes, meridiem] = match
  hours = Number(hours)
  minutes = Number(minutes)
  if (hours < 1 || hours > 12 || minutes > 59) return null
  meridiem = meridiem.toUpperCase()
  if (meridiem === 'AM') {
    if (hours === 12) hours = 0
  } else if (hours !== 12) {
    hours += 12
  }
  return hours * 60 + minutes
}

export function minutesToTimeLabel(totalMinutes) {
  const m = ((totalMinutes % 1440) + 1440) % 1440
  let hours = Math.floor(m / 60)
  const minutes = m % 60
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

const BUFFER_MINUTES = 30
const SLOT_INTERVAL_MINUTES = 15

/**
 * Returns { earliest, latest } in minutes-since-midnight for the pickup
 * window (opens + 30min .. closes - 30min), or null if the truck's hours
 * aren't set or the window is too narrow to allow any pickup.
 */
export function getPickupWindow(opensAt, closesAt) {
  const opens = parseTimeToMinutes(opensAt)
  const closes = parseTimeToMinutes(closesAt)
  if (opens == null || closes == null) return null

  const earliest = opens + BUFFER_MINUTES
  const latest = closes - BUFFER_MINUTES
  if (latest <= earliest) return null
  return { earliest, latest }
}

/** Generates the list of selectable pickup slot labels for a truck's hours. */
export function generatePickupSlots(opensAt, closesAt) {
  const window = getPickupWindow(opensAt, closesAt)
  if (!window) return []
  const slots = []
  for (let t = window.earliest; t <= window.latest; t += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTimeLabel(t))
  }
  return slots
}

/** True if `pickupTime` (e.g. "1:30 PM") falls within the truck's allowed pickup window. */
export function isValidPickupTime(pickupTime, opensAt, closesAt) {
  const window = getPickupWindow(opensAt, closesAt)
  if (!window) return false
  const minutes = parseTimeToMinutes(pickupTime)
  if (minutes == null) return false
  return minutes >= window.earliest && minutes <= window.latest
}
