import { Suspense, lazy, useEffect, useState } from 'react'
import { MapPin, Clock, Navigation, ShoppingBag, Phone } from 'lucide-react'
import { getTodaysTruckLocation } from '../services/api'
import Reveal from './ui/Reveal'
import SwooshDivider from './ui/SwooshDivider'
import truckImg from '../assets/images/food-truck.jpg'

const TruckMap = lazy(() => import('./ui/TruckMap'))

const POLL_MS = 20000

export default function TruckLocation() {
  const [truck, setTruck] = useState(null)
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      getTodaysTruckLocation()
        .then((data) => {
          if (cancelled) return
          setTruck(data)
          setConnected(true)
        })
        .catch(() => {
          if (cancelled) return
          setConnected(false)
        })
    }

    load()
    const interval = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Placeholder copy shown only if the API can't be reached.
  const address = truck?.address ?? 'Bandra Kurla Complex, Mumbai'
  const lat = truck?.lat ?? 19.0663
  const lng = truck?.lng ?? 72.8681
  const hours = truck?.opensAt && truck?.closesAt ? `${truck.opensAt} – ${truck.closesAt}` : '11:00 AM – 8:00 PM'
  const openNow = truck ? truck.openNow : true
  const directionsUrl =
    truck?.lat && truck?.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${truck.lat},${truck.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <section id="truck" className="relative bg-navy text-white">
      <SwooshDivider color="#FAF9F4" />
      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-20 md:pb-28 pt-2 md:pt-4">
        <Reveal className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">
            Find Protein Bae Near You
          </h2>
          <p className="mt-3 text-white/70">
            Your protein fix could be closer than you think.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12 grid lg:grid-cols-5 rounded-[28px] overflow-hidden shadow-2xl">
          {/* live map, driven by whatever lat/lng the admin sets in the truck panel */}
          <div className="lg:col-span-3 relative min-h-[280px] bg-[#0F1D47]">
            <Suspense
              fallback={<div className="w-full h-full min-h-[280px] flex items-center justify-center text-white/40 text-sm">Loading map…</div>}
            >
              <TruckMap
                lat={lat}
                lng={lng}
                address={address}
                className="w-full h-full min-h-[280px]"
              />
            </Suspense>
            {openNow && (
              <span className="absolute top-4 right-4 z-[400] flex items-center gap-1.5 bg-yellow text-navy-deep text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-navy-deep animate-pulse" />
                Live
              </span>
            )}
            <p className="absolute bottom-3 left-4 z-[400] text-[11px] text-white/70 bg-navy-deep/70 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wide">
              {connected ? 'Live location, updated by the truck team' : 'Reconnecting…'}
            </p>
          </div>

          <div className="lg:col-span-2 bg-white text-ink p-8 flex flex-col">
            <span
              className={`inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                openNow ? 'bg-lightgreen text-green' : 'bg-navy/10 text-navy/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-green' : 'bg-navy/40'}`} />
              {openNow ? 'Open Now' : 'Closed Right Now'}
            </span>

            <p className="mt-5 flex items-center gap-3 font-display font-bold text-xl text-navy">
              <img src={truckImg} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
              {truck?.name || 'Protein Bae Food Truck'}
            </p>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin size={18} className="text-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-ink/50 uppercase text-[11px] tracking-wide">Today&apos;s Location</p>
                  <p className="font-semibold text-navy">{address}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={18} className="text-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-ink/50 uppercase text-[11px] tracking-wide">Hours Today</p>
                  <p className="font-semibold text-navy">{hours}</p>
                </div>
              </div>
              {truck?.phone && (
                <div className="flex gap-3">
                  <Phone size={18} className="text-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-ink/50 uppercase text-[11px] tracking-wide">Call the Truck</p>
                    <a href={`tel:${truck.phone}`} className="font-semibold text-navy hover:text-green">
                      {truck.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-navy-deep transition-colors"
              >
                <Navigation size={16} /> Get Directions
              </a>
              {truck?.phone && (
                <a
                  href={`tel:${truck.phone}`}
                  className="inline-flex items-center justify-center gap-2 border-2 border-navy text-navy font-bold text-sm uppercase tracking-wide py-3 rounded-full hover:bg-navy hover:text-white transition-colors"
                >
                  <Phone size={16} /> Call the Truck
                </a>
              )}
              <a
                href="#menu"
                className="inline-flex items-center justify-center gap-2 bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide py-3.5 rounded-full hover:bg-yellow-deep transition-colors"
              >
                <ShoppingBag size={16} /> Order For Pickup
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
