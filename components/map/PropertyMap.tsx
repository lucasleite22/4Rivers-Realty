'use client'

import dynamic from 'next/dynamic'
import { APIProvider } from '@vis.gl/react-google-maps'
import { useTranslations } from 'next-intl'
import type { PropertyWithImages } from '@/types/properties'

function MapLoading() {
  const t = useTranslations('propertyMap')
  return (
    <div className="w-full h-full bg-off-white animate-pulse flex items-center justify-center">
      <p className="font-barlow text-sm text-navy/40">{t('loading')}</p>
    </div>
  )
}

// The Google Maps JS binding reads window/document on import — must load client-side only.
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <MapLoading />,
})

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

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
  const t = useTranslations('propertyMap')

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`w-full ${height} rounded-xl overflow-hidden border border-navy/10 shadow-sm flex items-center justify-center bg-off-white`}
      >
        <p className="font-barlow text-sm text-navy/40 text-center px-6">
          {t('missingApiKey')}
        </p>
      </div>
    )
  }

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-navy/10 shadow-sm`}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <MapClient properties={properties} zoom={zoom} center={center} />
      </APIProvider>
    </div>
  )
}
