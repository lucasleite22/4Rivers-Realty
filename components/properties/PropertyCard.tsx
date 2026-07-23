'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import type { PropertyWithImages } from '@/types/properties'

interface Props {
  property: PropertyWithImages
}

export default function PropertyCard({ property }: Props) {
  const t = useTranslations('propertyCard')
  const tTypes = useTranslations('propertyTypes')
  const cover = property.coverImageUrl ?? property.images?.[0]?.url ?? null
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(property.priceUsd))

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-52 bg-off-white">
        {cover ? (
          <Image src={cover} alt={property.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy/20 font-barlow text-sm">
            {t('noPhoto')}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-navy text-white font-barlow text-xs px-2 py-1 rounded">
          {tTypes(property.type as 'HORSE_FARM' | 'RANCH' | 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND')}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-cormorant text-navy text-xl group-hover:text-brand-blue transition-colors line-clamp-1">
          {property.title}
        </h3>
        <p className="font-barlow text-sm text-gray-500 mt-1">
          {property.city}, {property.county} {t('countySuffix')}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-cormorant text-2xl text-navy">{price}</span>
          <span className="font-barlow text-sm text-gray-400">{Number(property.acreage)} {t('acresSuffix')}</span>
        </div>
      </div>
    </Link>
  )
}
