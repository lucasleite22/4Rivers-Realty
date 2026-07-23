'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LayoutGrid, Map } from 'lucide-react'
import PropertyGrid from './PropertyGrid'
import PropertyMap from '@/components/map/PropertyMap'
import { useProperties } from '@/hooks/useProperties'

type ViewMode = 'grid' | 'map'

function MapView() {
  const { properties, loading } = useProperties()
  if (loading) {
    return (
      <div className="w-full h-[520px] bg-gray-100 animate-pulse rounded-xl mt-6" />
    )
  }
  return <PropertyMap properties={properties} height="h-[520px]" />
}

export default function PropertiesViewToggle() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const t = useTranslations('propertiesViewToggle')

  return (
    <div>
      <div className="flex items-center justify-end mb-4 mt-6">
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold font-barlow transition-colors ${
              viewMode === 'grid'
                ? 'bg-navy text-white'
                : 'text-gray-500 hover:text-navy'
            }`}
            aria-label={t('gridAria')}
          >
            <LayoutGrid className="w-4 h-4" />
            {t('grid')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold font-barlow transition-colors ${
              viewMode === 'map'
                ? 'bg-navy text-white'
                : 'text-gray-500 hover:text-navy'
            }`}
            aria-label={t('mapAria')}
          >
            <Map className="w-4 h-4" />
            {t('map')}
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? <PropertyGrid /> : <MapView />}
    </div>
  )
}
