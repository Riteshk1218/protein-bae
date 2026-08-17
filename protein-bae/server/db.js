import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

//const __dirname = path.dirname(fileURLToPath(import.meta.url))
//const dbPath = path.join(__dirname, 'proteinbae.db')//

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || path.join(__dirname, 'proteinbae.db')



export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ---------------------------------------------------------------------
// Base schema (safe to run every boot -- CREATE TABLE IF NOT EXISTS).
// ---------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total INTEGER NOT NULL,
    pickup_time TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    source TEXT NOT NULL DEFAULT 'customer'
  );

  CREATE TABLE IF NOT EXISTS truck_location (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    open_now INTEGER NOT NULL DEFAULT 1,
    opens_at TEXT,
    closes_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    payment_method TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL DEFAULT 'admin',
    note TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    min_order INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    expiry_date TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    usage_limit INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coupon_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id),
    order_id INTEGER NOT NULL REFERENCES orders(id),
    used_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    art TEXT NOT NULL DEFAULT 'bowl',
    protein INTEGER NOT NULL DEFAULT 0,
    calories INTEGER NOT NULL DEFAULT 0,
    price INTEGER NOT NULL,
    available INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trucks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    opens_at TEXT,
    closes_at TEXT,
    active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS partnership_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    full_name TEXT NOT NULL,
    business_name TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    partnership_type TEXT NOT NULL,
    location TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'New'
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New'
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// ---------------------------------------------------------------------
// Column migrations -- add columns that may not exist on older DBs
// without touching existing rows.
// ---------------------------------------------------------------------
function ensureColumn(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all()
  const has = existing.some((c) => c.name === column)
  if (!has) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

ensureColumn('orders', 'customer_email', 'TEXT')
ensureColumn('orders', 'customer_id', 'INTEGER REFERENCES customers(id)')
ensureColumn('orders', 'subtotal', 'INTEGER')
ensureColumn('orders', 'discount', 'INTEGER NOT NULL DEFAULT 0')
ensureColumn('orders', 'coupon_code', 'TEXT')
ensureColumn('orders', 'payment_status', "TEXT NOT NULL DEFAULT 'UNPAID'")
ensureColumn('orders', 'last_status_emailed', 'TEXT')
ensureColumn('orders', 'truck_id', 'INTEGER REFERENCES trucks(id)')
ensureColumn('menu_items', 'ingredients', "TEXT NOT NULL DEFAULT '[]'")
ensureColumn('menu_items', 'image_url', 'TEXT')
ensureColumn('truck_location', 'phone', 'TEXT')

// Backfill subtotal for any pre-existing rows where it's still null.
db.prepare(`UPDATE orders SET subtotal = total WHERE subtotal IS NULL`).run()

// One-time migration: move the old singleton truck_location row into the
// new multi-truck `trucks` table as the first (active) truck. truck_location
// itself is left in place afterward -- unused, but harmless -- so this
// migration never has to run twice.
const trucksCount = db.prepare('SELECT COUNT(*) AS n FROM trucks').get().n
if (trucksCount === 0) {
  const legacy = db.prepare('SELECT * FROM truck_location WHERE id = 1').get()
  if (legacy) {
    db.prepare(
      `INSERT INTO trucks (name, phone, address, lat, lng, opens_at, closes_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'Protein Bae Food Truck',
      legacy.phone || null,
      legacy.address,
      legacy.lat,
      legacy.lng,
      legacy.opens_at,
      legacy.closes_at,
      1 // always seed as the active truck so the site has one to show
    )
  } else {
    db.prepare(
      `INSERT INTO trucks (name, phone, address, lat, lng, opens_at, closes_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    ).run('Protein Bae Food Truck', null, 'Bandra Kurla Complex, Mumbai', 19.0663, 72.8681, '11:00 AM', '8:00 PM')
  }
}

export const menu = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'menu.json'), 'utf-8')
)

// Seed menu_items from data/menu.json the first time the table is empty
// (fresh install or a DB that predates the menu-management feature). Once
// seeded, data/menu.json is no longer read again -- the database is the
// live source of truth so admin edits persist without a restart.
const menuCount = db.prepare('SELECT COUNT(*) AS n FROM menu_items').get().n
if (menuCount === 0) {
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (id, name, description, art, protein, calories, price, available, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  menu.forEach((item, i) => {
    insertMenuItem.run(
      item.id,
      item.name,
      item.description || '',
      item.art || 'bowl',
      item.protein || 0,
      item.calories || 0,
      item.price,
      item.available === false ? 0 : 1,
      i
    )
  })
}

export const MENU_ART_STYLES = ['salad', 'grain', 'wrap', 'shake']
export const PAYMENT_METHODS = ['Cash', 'Google Pay / UPI', 'PhonePe', 'Paytm', 'Card', 'Bank Transfer', 'Other']
export const ORDER_STATUSES = ['received', 'preparing', 'ready', 'completed', 'cancelled']
export const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']
export const PARTNERSHIP_TYPES = [
  'Gym',
  'Yoga Centre',
  'Sports Club',
  'Corporate Office',
  'Residential Community',
  'Fitness Event',
  'Other',
]
export const PARTNERSHIP_STATUSES = ['New', 'Contacted', 'Closed']
export const CONTACT_STATUSES = ['New', 'Read', 'Replied', 'Closed']
