'use client'

import dynamic from 'next/dynamic'
import type { PropertyWithImages } from '@/types/properties'

// Leaflet must be loaded client-side only — it reads window/document on import.
// next/dynamic with ssr:false is the official Next.js pattern for this.
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-off-white animate-pulse flex items-center justify-center">
      <p className="font-barlow text-sm text-navy/40">Loading map…</p>
    </div>
  ),
})

interface Props {
  properties: PropertyWithImages[]
  /** Tailwind height class, e.g. "h-[500px]" */
  height?: string
  zoom?: number
  center?: [number, number]
}

/**
 * Drop-in map component — safe to import from any Server or Client component.
 *
 * Usage:
 *   <PropertyMap properties={properties} height="h-[480px]" />
 */
export default function PropertyMap({
  properties,
  height = 'h-[480px]',
  zoom,
  center,
}: Props) {
  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-navy/10 shadow-sm`}>
      <MapClient properties={properties} zoom={zoom} center={center} />
    </div>
  )
}
