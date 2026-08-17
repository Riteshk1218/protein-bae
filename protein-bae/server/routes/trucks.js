import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { getActiveTruck, getAllTrucks, getTruckById, setActiveTruck } from '../services/trucks.js'
import { generatePickupSlots } from '../services/pickup.js'

export const truckRouter = Router()
export const trucksAdminRouter = Router()

function publicShape(truck) {
  if (!truck) return null
  return {
    id: truck.id,
    name: truck.name,
    phone: truck.phone,
    address: truck.address,
    lat: truck.lat,
    lng: truck.lng,
    opensAt: truck.opens_at,
    closesAt: truck.closes_at,
    openNow: truck.active, // kept as `openNow` for frontend compatibility
    pickupSlots: generatePickupSlots(truck.opens_at, truck.closes_at),
  }
}

// GET /api/truck -- the currently active truck (public, polled by the site)
truckRouter.get('/', (req, res) => {
  const truck = getActiveTruck()
  if (!truck) return res.status(404).json({ error: 'No active truck right now.' })
  res.json(publicShape(truck))
})

// ---- Admin: manage all trucks ----

// GET /api/admin/trucks -- list every truck
trucksAdminRouter.get('/', requireAdmin, (req, res) => {
  res.json(getAllTrucks())
})

// POST /api/admin/trucks -- add a new truck
trucksAdminRouter.post('/', requireAdmin, (req, res) => {
  const { name, phone, address, lat, lng, opensAt, closesAt, active } = req.body || {}
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required.' })
  }

  const info = db
    .prepare(
      `INSERT INTO trucks (name, phone, address, lat, lng, opens_at, closes_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(name.trim(), phone || null, address.trim(), lat ?? null, lng ?? null, opensAt || null, closesAt || null)

  if (active) setActiveTruck(info.lastInsertRowid)

  res.status(201).json(getTruckById(info.lastInsertRowid))
})

// PUT /api/admin/trucks/:id -- edit a truck (and optionally activate it)
trucksAdminRouter.put('/:id', requireAdmin, (req, res) => {
  const existing = getTruckById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Truck not found.' })

  const { name, phone, address, lat, lng, opensAt, closesAt, active } = req.body || {}
  const next = {
    name: name ?? existing.name,
    phone: phone ?? existing.phone,
    address: address ?? existing.address,
    lat: lat ?? existing.lat,
    lng: lng ?? existing.lng,
    opensAt: opensAt ?? existing.opens_at,
    closesAt: closesAt ?? existing.closes_at,
  }
  if (!next.name || !next.address) {
    return res.status(400).json({ error: 'Name and address are required.' })
  }

  db.prepare(
    `UPDATE trucks
     SET name = ?, phone = ?, address = ?, lat = ?, lng = ?, opens_at = ?, closes_at = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(next.name, next.phone || null, next.address, next.lat ?? null, next.lng ?? null, next.opensAt || null, next.closesAt || null, req.params.id)

  if (active === true) setActiveTruck(req.params.id)

  res.json(getTruckById(req.params.id))
})

// DELETE /api/admin/trucks/:id
trucksAdminRouter.delete('/:id', requireAdmin, (req, res) => {
  const existing = getTruckById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Truck not found.' })
  db.prepare('DELETE FROM trucks WHERE id = ?').run(req.params.id)
  res.status(204).end()
})
