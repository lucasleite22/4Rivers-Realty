'use client'

import dynamic from 'next/dynamic'
import type { MapProperty, MapLabels } from './MapClient'

function MapLoading({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className="w-full h-full bg-off-white animate-pulse flex items-center justify-center">
      <p className="font-barlow text-sm text-navy/40">{loadingLabel}</p>
    </div>
  )
}

const DEFAULT_LOADING_LABEL = 'Loading map…'

// Leaflet must be loaded client-side only — it reads window/document on
// import. next/dynamic with ssr:false is the official Next.js pattern for
// this. Kept at module scope so it isn't recreated (and MapClient
// remounted) on every render.
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <MapLoading loadingLabel={DEFAULT_LOADING_LABEL} />,
})

interface Props {
  properties: MapProperty[]
  /** Tailwind height class, e.g. "h-[500px]" */
  height?: string
  zoom?: number
  center?: [number, number]
  labels?: MapLabels
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
  labels,
}: Props) {
  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-navy/10 shadow-sm`}>
      <MapClient properties={properties} zoom={zoom} center={center} labels={labels} />
    </div>
  )
}
