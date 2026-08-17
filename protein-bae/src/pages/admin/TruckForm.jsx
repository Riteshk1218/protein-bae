import { useState, Suspense, lazy } from 'react'
import { LocateFixed, X } from 'lucide-react'
import { createTruck, updateTruck } from '../../services/api'

const TruckMap = lazy(() => import('../../components/ui/TruckMap'))

export default function TruckForm({ truck, onCancel, onSaved }) {
  const isEdit = Boolean(truck?.id)
  const [form, setForm] = useState({
    name: truck?.name || '',
    address: truck?.address || '',
    lat: truck?.lat ?? '',
    lng: truck?.lng ?? '',
    opensAt: truck?.opens_at || '',
    closesAt: truck?.closes_at || '',
    phone: truck?.phone || '',
    active: truck?.active ?? false,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }))
      },
      () => setError('Could not read your current location.')
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.address.trim()) {
      setError('Name and address are required.')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      lat: form.lat === '' ? null : Number(form.lat),
      lng: form.lng === '' ? null : Number(form.lng),
      opensAt: form.opensAt.trim() || null,
      closesAt: form.closesAt.trim() || null,
      phone: form.phone.trim() || null,
      active: form.active,
    }
    try {
      if (isEdit) {
        await updateTruck(truck.id, payload)
      } else {
        await createTruck(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not save this truck.')
    } finally {
      setSaving(false)
    }
  }

  const previewLat = form.lat === '' ? undefined : Number(form.lat)
  const previewLng = form.lng === '' ? undefined : Number(form.lng)

  return (
    <div className="grid lg:grid-cols-5 gap-6 bg-white rounded-[22px] shadow-card p-6">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-navy">{isEdit ? 'Edit Truck' : 'Add Truck'}</h3>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-navy/40 hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div>
          <label htmlFor="truck-name" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
            Truck Name
          </label>
          <input
            id="truck-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
            placeholder="e.g. Protein Bae Truck 1"
          />
        </div>

        <div>
          <label htmlFor="truck-address" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
            Address
          </label>
          <input
            id="truck-address"
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
            placeholder="e.g. Bandra Kurla Complex, Mumbai"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="truck-lat" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Latitude
            </label>
            <input
              id="truck-lat"
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
            />
          </div>
          <div>
            <label htmlFor="truck-lng" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Longitude
            </label>
            <input
              id="truck-lng"
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-1.5 text-green text-xs font-bold uppercase tracking-wide hover:text-green-deep transition-colors"
        >
          <LocateFixed size={14} /> Use My Current Location
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="truck-opens" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Opens At
            </label>
            <input
              id="truck-opens"
              type="text"
              value={form.opensAt}
              onChange={(e) => setForm({ ...form, opensAt: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              placeholder="11:00 AM"
            />
          </div>
          <div>
            <label htmlFor="truck-closes" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
              Closes At
            </label>
            <input
              id="truck-closes"
              type="text"
              value={form.closesAt}
              onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
              className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
              placeholder="8:00 PM"
            />
          </div>
        </div>

        <div>
          <label htmlFor="truck-phone" className="block text-xs font-bold uppercase tracking-wide text-navy/70 mb-1.5">
            Truck Phone Number
          </label>
          <input
            id="truck-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm focus:border-green outline-none"
            placeholder="e.g. +91 98765 43210"
          />
          <p className="text-ink/40 text-xs mt-1">Shown as a &quot;Call the Truck&quot; button to customers.</p>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="w-4 h-4 accent-green"
          />
          <span className="text-sm font-semibold text-navy">
            Make this the active truck shown to customers
          </span>
        </label>
        <p className="text-ink/40 text-xs -mt-2">Only one truck can be active at a time.</p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-navy text-white font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-navy-deep transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Truck'}
        </button>
      </form>

      <div className="lg:col-span-3 rounded-[18px] overflow-hidden min-h-[320px]">
        <Suspense
          fallback={<div className="w-full h-full min-h-[320px] flex items-center justify-center text-navy/40 text-sm bg-lightgreen">Loading map…</div>}
        >
          <TruckMap lat={previewLat} lng={previewLng} address={form.address} className="w-full h-full min-h-[320px]" />
        </Suspense>
      </div>
    </div>
  )
}
