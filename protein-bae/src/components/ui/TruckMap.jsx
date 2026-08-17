import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite doesn't resolve Leaflet's default marker image paths automatically --
// point them at the bundled assets once, for every marker on the page.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const truckIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:44px;height:44px;border-radius:9999px;background:#F2C21A;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 20px rgba(23,33,59,0.45);border:3px solid #172A63;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#172A63" stroke-width="2.5">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -36],
})

/** Recenters the map whenever the truck's coordinates change. */
function Recenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      map.setView([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])
  return null
}

export default function TruckMap({ lat, lng, address, className = '', zoom = 15, interactive = true }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return (
      <div className={`flex items-center justify-center bg-navy-deep text-white/50 text-sm ${className}`}>
        No coordinates set yet.
      </div>
    )
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      touchZoom={interactive}
      className={className}
      aria-label={address ? `Map showing the truck at ${address}` : 'Map showing the truck location'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={truckIcon}>
        {address && <Popup>{address}</Popup>}
      </Marker>
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  )
}
