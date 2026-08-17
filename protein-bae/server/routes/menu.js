import { Router } from 'express'
import { db, MENU_ART_STYLES } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { getMenuItems, getMenuItemById } from '../services/menu.js'

export const menuRouter = Router()

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Accepts either an array of strings or a comma-separated string from the
// admin form, and always stores a clean JSON array of trimmed names.
function normalizeIngredients(value) {
  if (value == null) return '[]'
  const list = Array.isArray(value) ? value : String(value).split(',')
  const cleaned = list.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
  return JSON.stringify(cleaned)
}

function validatePayload(body, { partial = false } = {}) {
  const { name, art, protein, calories, price } = body || {}

  if (!partial || name !== undefined) {
    if (!name || !String(name).trim()) return 'Name is required.'
  }
  if (!partial || price !== undefined) {
    if (price == null || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      return 'Enter a valid price greater than 0.'
    }
  }
  if (art !== undefined && !MENU_ART_STYLES.includes(art)) {
    return `Art style must be one of: ${MENU_ART_STYLES.join(', ')}`
  }
  if (protein !== undefined && (!Number.isFinite(Number(protein)) || Number(protein) < 0)) {
    return 'Protein must be a non-negative number.'
  }
  if (calories !== undefined && (!Number.isFinite(Number(calories)) || Number(calories) < 0)) {
    return 'Calories must be a non-negative number.'
  }
  return null
}

// GET /api/menu -- today's menu (public)
menuRouter.get('/', (req, res) => {
  res.json(getMenuItems())
})

// POST /api/menu -- admin: add a new product
menuRouter.post('/', requireAdmin, (req, res) => {
  const error = validatePayload(req.body)
  if (error) return res.status(400).json({ error })

  const { name, description, art, protein, calories, price, available, ingredients, imageUrl } = req.body

  let id = slugify(name)
  if (!id) return res.status(400).json({ error: 'Could not generate an id from that name.' })
  if (getMenuItemById(id)) {
    id = `${id}-${Date.now().toString().slice(-5)}`
  }

  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM menu_items').get().m

  db.prepare(
    `INSERT INTO menu_items (id, name, description, art, protein, calories, price, available, sort_order, ingredients, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    name.trim(),
    (description || '').trim(),
    art || 'bowl',
    Number(protein) || 0,
    Number(calories) || 0,
    Math.round(Number(price)),
    available === false ? 0 : 1,
    maxOrder + 1,
    normalizeIngredients(ingredients),
    (imageUrl || '').trim() || null
  )

  res.status(201).json(getMenuItemById(id))
})

// PUT /api/menu/:id -- admin: edit a product (any subset of fields)
menuRouter.put('/:id', requireAdmin, (req, res) => {
  const existing = getMenuItemById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Menu item not found.' })

  const error = validatePayload(req.body, { partial: true })
  if (error) return res.status(400).json({ error })

  const next = { ...existing, ...req.body }
  const ingredientsJson =
    req.body.ingredients !== undefined ? normalizeIngredients(req.body.ingredients) : JSON.stringify(existing.ingredients)
  const imageUrl = req.body.imageUrl !== undefined ? (String(req.body.imageUrl).trim() || null) : existing.image_url

  db.prepare(
    `UPDATE menu_items
     SET name = ?, description = ?, art = ?, protein = ?, calories = ?, price = ?, available = ?, ingredients = ?, image_url = ?
     WHERE id = ?`
  ).run(
    String(next.name).trim(),
    String(next.description || '').trim(),
    next.art || 'bowl',
    Number(next.protein) || 0,
    Number(next.calories) || 0,
    Math.round(Number(next.price)),
    next.available === false ? 0 : 1,
    ingredientsJson,
    imageUrl,
    req.params.id
  )

  res.json(getMenuItemById(req.params.id))
})

// DELETE /api/menu/:id -- admin: remove a product
menuRouter.delete('/:id', requireAdmin, (req, res) => {
  const existing = getMenuItemById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Menu item not found.' })
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id)
  res.status(204).end()
})
