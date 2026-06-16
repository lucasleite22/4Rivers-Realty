'use client'

import { useProperties } from '@/hooks/useProperties'
import PropertyCard from './PropertyCard'

export default function PropertyGrid() {
  const { properties, loading, error } = useProperties()

  if (loading) return null // parent Suspense shows skeleton

  if (error) {
    return (
      <p className="font-barlow text-center text-gray-500 py-20">
        Could not load properties. Please try again.
      </p>
    )
  }

  if (!properties.length) {
    return (
      <p className="font-barlow text-center text-gray-400 py-20">
        No properties found.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}
