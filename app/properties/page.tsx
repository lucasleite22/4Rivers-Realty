import { Suspense } from 'react'
import PropertyGrid from '@/components/properties/PropertyGrid'
import PropertyFilters from '@/components/properties/PropertyFilters'

export const metadata = {
  title: 'Properties | 4Rivers Realty',
  description: 'Browse horse farms, ranches, and land in Ocala & Sumter County, FL',
}

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-site-bg">
      <section className="bg-navy pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-cormorant text-4xl text-white mb-2">Properties</h1>
          <p className="font-barlow text-cyan-brand">
            Ocala &amp; Sumter County, Florida
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <PropertyFilters />
        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyGrid />
        </Suspense>
      </section>
    </main>
  )
}

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />
      ))}
    </div>
  )
}
