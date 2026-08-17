import { db } from '../db.js'

export function getMenuItems() {
  const rows = db.prepare('SELECT * FROM menu_items ORDER BY sort_order ASC, id ASC').all()
  return rows.map(serialize)
}

export function getMenuItemById(id) {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id)
  return row ? serialize(row) : null
}

function serialize(row) {
  let ingredients = []
  try {
    ingredients = JSON.parse(row.ingredients || '[]')
  } catch {
    ingredients = []
  }
  return { ...row, available: !!row.available, ingredients }
}
