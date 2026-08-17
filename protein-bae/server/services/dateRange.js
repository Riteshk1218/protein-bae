// Resolves a named or custom date filter into [startISO, endISO) bounds
// that line up with the UTC timestamps SQLite's datetime('now') writes
// into created_at columns.

function toDateOnly(d) {
  return d.toISOString().slice(0, 10)
}

export function resolveRange(filter, startDate, endDate) {
  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  switch (filter) {
    case 'yesterday': {
      const start = new Date(todayStart)
      start.setUTCDate(start.getUTCDate() - 1)
      const end = new Date(todayStart)
      return { start: `${toDateOnly(start)} 00:00:00`, end: `${toDateOnly(end)} 00:00:00` }
    }
    case 'week': {
      // Monday-start week containing today.
      const day = (todayStart.getUTCDay() + 6) % 7 // 0 = Monday
      const start = new Date(todayStart)
      start.setUTCDate(start.getUTCDate() - day)
      const end = new Date(todayStart)
      end.setUTCDate(end.getUTCDate() + 1)
      return { start: `${toDateOnly(start)} 00:00:00`, end: `${toDateOnly(end)} 00:00:00` }
    }
    case 'month': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      const end = new Date(todayStart)
      end.setUTCDate(end.getUTCDate() + 1)
      return { start: `${toDateOnly(start)} 00:00:00`, end: `${toDateOnly(end)} 00:00:00` }
    }
    case 'custom': {
      if (!startDate || !endDate) {
        throw new Error('Custom range requires startDate and endDate (YYYY-MM-DD).')
      }
      const end = new Date(`${endDate}T00:00:00.000Z`)
      end.setUTCDate(end.getUTCDate() + 1)
      return { start: `${startDate} 00:00:00`, end: `${toDateOnly(end)} 00:00:00` }
    }
    case 'today':
    default: {
      const end = new Date(todayStart)
      end.setUTCDate(end.getUTCDate() + 1)
      return { start: `${toDateOnly(todayStart)} 00:00:00`, end: `${toDateOnly(end)} 00:00:00` }
    }
  }
}
