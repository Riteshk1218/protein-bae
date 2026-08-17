import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api'

const ART_STYLES = ['salad', 'grain', 'wrap', 'shake']

const emptyForm = {
  name: '',
  description: '',
  art: 'salad',
  protein: '',
  calories: '',
  price: '',
  available: true,
  ingredientsText: '',
  image_url: '',
}

function toFormState(item) {
  if (!item) return emptyForm
  return { ...item, ingredientsText: (item.ingredients || []).join(', ') }
}

function ItemForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(toFormState(initial))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(initial?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.price) {
      setError('Name and price are required.')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      art: form.art,
      protein: Number(form.protein) || 0,
      calories: Number(form.calories) || 0,
      price: Number(form.price),
      available: form.available,
      imageUrl: form.image_url?.trim() || undefined,
      ingredients: form.ingredientsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    try {
      if (isEdit) {
        await updateMenuItem(initial.id, payload)
      } else {
        await createMenuItem(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not save this item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-navy">{isEdit ? 'Edit Item' : 'Add New Item'}</p>
        <button type="button" onClick={onCancel} aria-label="Cancel" className="text-navy/40 hover:text-navy">
          <X size={18} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Name, e.g. Protein Sandwich"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
      />
      <textarea
        rows={2}
        placeholder="Short description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none resize-none"
      />

      <div>
        <input
          type="url"
          placeholder="Image URL (optional — leave blank to use the illustration below)"
          value={form.image_url || ''}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          placeholder="Price (₹)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
        />
        <select
          value={form.art}
          onChange={(e) => setForm({ ...form, art: e.target.value })}
          className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
        >
          {ART_STYLES.map((a) => (
            <option key={a} value={a}>
              {a[0].toUpperCase() + a.slice(1)} illustration
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Protein (g)"
          value={form.protein}
          onChange={(e) => setForm({ ...form, protein: e.target.value })}
          className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
        />
        <input
          type="number"
          min="0"
          placeholder="Calories"
          value={form.calories}
          onChange={(e) => setForm({ ...form, calories: e.target.value })}
          className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy/70">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
          className="rounded border-navy/30"
        />
        Available for ordering
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
      </button>
    </form>
  )
}

export default function MenuPanel() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null) // null | 'new' | item id
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    getMenu()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSaved = () => {
    setEditingId(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from the menu?')) return
    setDeletingId(id)
    try {
      await deleteMenuItem(id)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-lg text-navy">Menu</h2>
        {editingId !== 'new' && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-navy-deep transition-colors"
          >
            <Plus size={14} /> Add Item
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}

      {editingId === 'new' && (
        <div className="mb-6">
          <ItemForm onCancel={() => setEditingId(null)} onSaved={handleSaved} />
        </div>
      )}

      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="sm:col-span-2">
              <ItemForm initial={item} onCancel={() => setEditingId(null)} onSaved={handleSaved} />
            </li>
          ) : (
            <li key={item.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  )}
                  <div>
                    <p className="font-display font-bold text-navy text-sm">{item.name}</p>
                    <p className="text-ink/50 text-xs mt-1">
                      {item.protein}g protein &middot; {item.calories} cal
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        item.available ? 'bg-lightgreen text-green' : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <span className="font-display font-extrabold text-navy shrink-0">₹{item.price}</span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-navy/8">
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className="inline-flex items-center gap-1.5 text-navy text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full border border-navy/15 hover:border-navy transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="inline-flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <Trash2 size={13} /> {deletingId === item.id ? 'Removing…' : 'Delete'}
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
