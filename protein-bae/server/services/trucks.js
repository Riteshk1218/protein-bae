import { db } from '../db.js'

function serialize(row) {
  if (!row) return null
  return { ...row, active: !!row.active }
}

export function getActiveTruck() {
  const row = db.prepare('SELECT * FROM trucks WHERE active = 1 ORDER BY updated_at DESC LIMIT 1').get()
  return serialize(row)
}

export function getTruckById(id) {
  return serialize(db.prepare('SELECT * FROM trucks WHERE id = ?').get(id))
}

export function getAllTrucks() {
  return db.prepare('SELECT * FROM trucks ORDER BY active DESC, id ASC').all().map(serialize)
}

/** Only one truck can be active at a time -- activating one deactivates the rest. */
export function setActiveTruck(id) {
  const activate = db.transaction((truckId) => {
    db.prepare('UPDATE trucks SET active = 0').run()
    db.prepare("UPDATE trucks SET active = 1, updated_at = datetime('now') WHERE id = ?").run(truckId)
  })
  activate(id)
}
