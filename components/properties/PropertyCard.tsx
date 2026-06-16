import Link from 'next/link'
import Image from 'next/image'
import type { PropertyWithImages } from '@/types/properties'

interface Props {
  property: PropertyWithImages
}

const TYPE_LABELS: Record<string, string> = {
  HORSE_FARM: 'Horse Farm',
  RANCH: 'Ranch',
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
}

export default function PropertyCard({ property }: Props) {
  const cover = property.coverImageUrl ?? property.images?.[0]?.url ?? null
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.priceUsd)

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-52 bg-site-bg">
        {cover ? (
          <Image src={cover} alt={property.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy/20 font-barlow text-sm">
            No photo
          </div>
        )}
        <span className="absolute top-3 left-3 bg-navy text-white font-barlow text-xs px-2 py-1 rounded">
          {TYPE_LABELS[property.type] ?? property.type}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-cormorant text-navy text-xl group-hover:text-cyan-brand transition-colors line-clamp-1">
          {property.title}
        </h3>
        <p className="font-barlow text-sm text-gray-500 mt-1">
          {property.city}, {property.county} County
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-cormorant text-2xl text-navy">{price}</span>
          <span className="font-barlow text-sm text-gray-400">{property.acreage} ac</span>
        </div>
      </div>
    </Link>
  )
}
