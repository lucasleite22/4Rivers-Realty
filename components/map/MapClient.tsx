'use client'

import { useEffect, useState } from 'react'
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { PropertyWithImages } from '@/types/properties'

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

// ── Auto-fit map to all markers ───────────────────────────────
function FitBounds({ properties }: { properties: PropertyWithImages[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !properties.length) return
    const coords = properties.filter((p) => p.latitude != null && p.longitude != null)
    if (coords.length === 0) return
    if (coords.length === 1) {
      map.panTo({ lat: coords[0].latitude as number, lng: coords[0].longitude as number })
      map.setZoom(13)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    coords.forEach((p) =>
      bounds.extend({ lat: p.latitude as number, lng: p.longitude as number })
    )
    map.fitBounds(bounds, 40)
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
  const t = useTranslations('mapClient')
  const tCard = useTranslations('propertyCard')
  const [activeId, setActiveId] = useState<string | null>(null)

  const mapped = properties.filter((p) => p.latitude != null && p.longitude != null)
  const activeProp = mapped.find((p) => p.id === activeId) ?? null

  return (
    <Map
      className={className}
      defaultCenter={{ lat: center[0], lng: center[1] }}
      defaultZoom={zoom}
      mapId={MAP_ID}
      scrollwheel={false}
      gestureHandling="greedy"
    >
      {mapped.length > 1 && <FitBounds properties={properties} />}

      {mapped.map((prop) => (
        <AdvancedMarker
          key={prop.id}
          position={{ lat: prop.latitude as number, lng: prop.longitude as number }}
          onClick={() => setActiveId(prop.id)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#252859',
              border: '3px solid #86ACDB',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
              cursor: 'pointer',
            }}
          />
        </AdvancedMarker>
      ))}

      {activeProp && (
        <InfoWindow
          position={{
            lat: activeProp.latitude as number,
            lng: activeProp.longitude as number,
          }}
          onCloseClick={() => setActiveId(null)}
          minWidth={220}
        >
          <div className="font-barlow text-sm">
            {activeProp.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeProp.coverImageUrl}
                alt={activeProp.title}
                className="w-full h-28 object-cover rounded mb-2"
              />
            )}
            <p className="font-cormorant font-bold text-base text-navy leading-snug">
              {activeProp.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {activeProp.city}, {activeProp.county} {tCard('countySuffix')} ·{' '}
              {Number(activeProp.acreage)} {tCard('acresSuffix')}
            </p>
            <p className="font-cormorant font-bold text-lg text-navy mt-1">
              {fmtPrice(activeProp.priceUsd)}
            </p>
            <Link
              href={`/properties/${activeProp.id}`}
              className="block mt-2 text-center bg-navy text-white text-xs font-semibold py-1.5 rounded hover:bg-brand-blue transition-colors"
            >
              {t('viewDetails')}
            </Link>
          </div>
        </InfoWindow>
      )}
    </Map>
  )
}
