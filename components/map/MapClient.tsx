'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import Link from 'next/link'
import type { PropertyWithImages } from '@/types/properties'

// ── Fix Leaflet default icon path broken by webpack ──────────
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

// ── Custom navy marker ────────────────────────────────────────
function createCustomIcon() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;
        background:#174079;
        border:3px solid #00aeef;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

// ── Auto-fit map to all markers ───────────────────────────────
function FitBounds({ properties }: { properties: PropertyWithImages[] }) {
  const map = useMap()
  useEffect(() => {
    if (!properties.length) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const coords = properties
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [p.latitude as number, p.longitude as number] as [number, number])
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 13 })
    }
  }, [map, properties])
  return null
}

// ── Price formatter ───────────────────────────────────────────
function fmtPrice(n: number | { toNumber(): number }) {
  if (typeof n !== 'number') n = n.toNumber()
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${Math.round(n / 1000)}k`
}

// ── Main client component ─────────────────────────────────────
interface Props {
  properties: PropertyWithImages[]
  className?: string
  zoom?: number
  center?: [number, number]
}

// Ocala, FL center
const DEFAULT_CENTER: [number, number] = [29.1872, -82.1401]
const DEFAULT_ZOOM = 10

export default function MapClient({
  properties,
  className = 'w-full h-full',
  zoom = DEFAULT_ZOOM,
  center = DEFAULT_CENTER,
}: Props) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const customIcon = createCustomIcon()
  const mapped = properties.filter((p) => p.latitude != null && p.longitude != null)

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mapped.length > 1 && <FitBounds properties={properties} />}

      {mapped.map((prop) => (
        <Marker
          key={prop.id}
          position={[prop.latitude as number, prop.longitude as number]}
          icon={customIcon}
        >
          <Popup minWidth={220} maxWidth={260}>
            <div className="font-barlow text-sm">
              {prop.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prop.coverImageUrl}
                  alt={prop.title}
                  className="w-full h-28 object-cover rounded mb-2"
                />
              )}
              <p className="font-cormorant font-bold text-base text-navy leading-snug">
                {prop.title}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {prop.city}, {prop.county} County · {Number(prop.acreage)} ac
              </p>
              <p className="font-cormorant font-bold text-lg text-navy mt-1">
                {fmtPrice(prop.priceUsd)}
              </p>
              <Link
                href={`/properties/${prop.id}`}
                className="block mt-2 text-center bg-navy text-white text-xs font-semibold py-1.5 rounded hover:bg-[#00aeef] transition-colors"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
