'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, type ComponentType } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import NextLink from 'next/link'

// Plain next/link by default (safe everywhere, including /admin). The
// public site passes its own next-intl `Link` via the `LinkComponent` prop
// so URLs keep the locale prefix — next-intl's Link reads locale context
// that doesn't exist in the admin panel, and rendering it there is what
// broke "View Details" clicks inside the admin map popup.
const LinkC = NextLink as unknown as ComponentType<any>

// Labels are passed as props (not read via useTranslations) because this
// component also renders inside the admin panel, which has no
// NextIntlClientProvider in its tree — calling useTranslations there throws
// "context from NextIntlClientProvider was not found" and crashes the page.
export interface MapLabels {
  viewDetails: string
  countySuffix: string
  acresSuffix: string
}

const DEFAULT_LABELS: MapLabels = {
  viewDetails: 'View Details',
  countySuffix: 'County',
  acresSuffix: 'ac',
}

// react-leaflet@4.2.1's component types predate the React 18.3 JSX typings
// (@types/react), which changed how a component's implicit children prop is
// inferred — tsc reports "cannot be used as a JSX component" for these even
// though they work fine at runtime. This is an upstream react-leaflet
// typing gap, not a real type error. Using `@ts-expect-error` for this was
// tried first, but it's brittle across environments: whether the error
// actually fires depends on exactly which @types/react patch version gets
// resolved, so a comment valid locally can become an "unused directive"
// build failure elsewhere (as happened on Vercel) — and vice versa. Casting
// once here is environment-independent.
const MapContainerC = MapContainer as unknown as ComponentType<any>
const TileLayerC = TileLayer as unknown as ComponentType<any>
const MarkerC = Marker as unknown as ComponentType<any>
const PopupC = Popup as unknown as ComponentType<any>

// Narrow, Prisma-agnostic shape — only what the map actually renders. Using
// this instead of the full PropertyWithImages (Prisma model) type lets both
// the public site (which has full Property rows) and the admin panel
// (which has its own, differently-shaped Property interface) pass data in
// here without an awkward cast — any object with at least these fields
// structurally satisfies it.
export interface MapProperty {
  id: string
  title: string
  city: string
  county: string
  acreage: number | string | { toString(): string }
  priceUsd: number | string | { toNumber(): number }
  latitude: number | null
  longitude: number | null
  coverImageUrl?: string | null
}

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
        background:#252859;
        border:3px solid #86ACDB;
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
function FitBounds({ properties }: { properties: MapProperty[] }) {
  const map = useMap()
  useEffect(() => {
    if (!properties.length) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const coords = properties
      .filter((p) => p.latitude != null && p.longitude != null && isInFlorida(p.latitude, p.longitude))
      .map((p) => [p.latitude as number, p.longitude as number] as [number, number])
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 13 })
    }
  }, [map, properties])
  return null
}

// ── Price formatter ───────────────────────────────────────────
//
// priceUsd is typed as Prisma.Decimal (which has .toNumber()), but that
// type only holds for a direct Prisma query. Properties fetched from the
// public JSON API (/api/properties) have already been through
// JSON.stringify, which serializes Decimal to a plain string — no
// .toNumber() method, which crashed every MLS-sourced listing that had
// lat/lng set (agent-entered listings don't yet have coordinates, so this
// path never ran for them).
function fmtPrice(n: number | string | { toNumber(): number }) {
  const value = typeof n === 'number' ? n : typeof n === 'string' ? Number(n) : n.toNumber()
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${Math.round(value / 1000)}k`
}

// ── Main client component ─────────────────────────────────────
interface Props {
  properties: MapProperty[]
  className?: string
  zoom?: number
  center?: [number, number]
  labels?: MapLabels
  /** Defaults to the public property page; admin passes '/admin/properties'. */
  detailsBasePath?: string
  /** Defaults to plain next/link; public site passes next-intl's locale-aware Link. */
  LinkComponent?: ComponentType<any>
}

// Ocala, FL center
const DEFAULT_CENTER: [number, number] = [29.1872, -82.1401]
const DEFAULT_ZOOM = 10

// Service area is Marion & Sumter County, FL. MLS feed data occasionally
// has a bad/missing geocode that resolves to some unrelated place on the
// globe (e.g. a listing once came through centered on India) — plotting it
// drags the auto-fit viewport to a zoomed-out, meaningless view instead of
// Florida. Anything outside a generous Florida bounding box is dropped
// rather than trusted.
const FLORIDA_BOUNDS = { minLat: 24, maxLat: 31.5, minLng: -88, maxLng: -79 }
function isInFlorida(lat: number, lng: number) {
  return (
    lat >= FLORIDA_BOUNDS.minLat &&
    lat <= FLORIDA_BOUNDS.maxLat &&
    lng >= FLORIDA_BOUNDS.minLng &&
    lng <= FLORIDA_BOUNDS.maxLng
  )
}

export default function MapClient({
  properties,
  className = 'w-full h-full',
  zoom = DEFAULT_ZOOM,
  center = DEFAULT_CENTER,
  labels = DEFAULT_LABELS,
  detailsBasePath = '/properties',
  LinkComponent = LinkC,
}: Props) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const customIcon = createCustomIcon()
  const mapped = properties.filter(
    (p) => p.latitude != null && p.longitude != null && isInFlorida(p.latitude, p.longitude)
  )

  return (
    <MapContainerC
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
    >
      <TileLayerC
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mapped.length > 1 && <FitBounds properties={properties} />}

      {mapped.map((prop) => (
        <MarkerC
          key={prop.id}
          position={[prop.latitude as number, prop.longitude as number]}
          icon={customIcon}
        >
          <PopupC minWidth={220} maxWidth={260}>
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
                {prop.city}, {prop.county} {labels.countySuffix} · {Number(prop.acreage)} {labels.acresSuffix}
              </p>
              <p className="font-cormorant font-bold text-lg text-navy mt-1">
                {fmtPrice(prop.priceUsd)}
              </p>
              <LinkComponent
                href={`${detailsBasePath}/${prop.id}`}
                className="block mt-2 text-center bg-navy text-white text-xs font-semibold py-1.5 rounded hover:bg-brand-blue transition-colors"
              >
                {labels.viewDetails}
              </LinkComponent>
            </div>
          </PopupC>
        </MarkerC>
      ))}
    </MapContainerC>
  )
}
