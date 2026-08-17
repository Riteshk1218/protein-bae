import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { getTrucks, updateTruck, deleteTruck } from '../../services/api'
import TruckForm from './TruckForm'

export default function TrucksPanel() {
  const [trucks, setTrucks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null) // null | 'new' | truck id
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    getTrucks()
      .then(setTrucks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSaved = () => {
    setEditingId(null)
    load()
  }

  const activate = async (truck) => {
    setBusyId(truck.id)
    try {
      await updateTruck(truck.id, { active: true })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (truck) => {
    if (truck.active) {
      setError('Activate a different truck before deleting this one.')
      return
    }
    if (!window.confirm(`Remove "${truck.name}"?`)) return
    setBusyId(truck.id)
    try {
      await deleteTruck(truck.id)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-lg text-navy">Food Trucks</h2>
        {editingId !== 'new' && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-navy-deep transition-colors"
          >
            <Plus size={14} /> Add Truck
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}

      {editingId === 'new' && (
        <div className="mb-6">
          <TruckForm onCancel={() => setEditingId(null)} onSaved={handleSaved} />
        </div>
      )}

      <ul className="space-y-4">
        {trucks.map((truck) =>
          editingId === truck.id ? (
            <li key={truck.id}>
              <TruckForm truck={truck} onCancel={() => setEditingId(null)} onSaved={handleSaved} />
            </li>
          ) : (
            <li key={truck.id} className="bg-white rounded-2xl shadow-card p-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-navy">{truck.name}</p>
                  {truck.active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-lightgreen text-green px-2.5 py-1 rounded-full">
                      <Star size={11} className="fill-green" /> Active
                    </span>
                  )}
                </div>
                <p className="text-ink/60 text-sm mt-1">{truck.address}</p>
                <p className="text-ink/50 text-xs mt-1">
                  {truck.opens_at && truck.closes_at ? `${truck.opens_at} – ${truck.closes_at}` : 'Hours not set'}
                  {truck.phone ? ` \u00b7 ${truck.phone}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!truck.active && (
                  <button
                    type="button"
                    onClick={() => activate(truck)}
                    disabled={busyId === truck.id}
                    className="text-green text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full border border-green/30 hover:bg-lightgreen transition-colors disabled:opacity-60"
                  >
                    Set Active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingId(truck.id)}
                  className="inline-flex items-center gap-1.5 text-navy text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full border border-navy/15 hover:border-navy transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(truck)}
                  disabled={busyId === truck.id}
                  className="inline-flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
