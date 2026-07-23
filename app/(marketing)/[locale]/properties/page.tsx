import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import PropertyFilters from '@/components/properties/PropertyFilters'
import PropertiesViewToggle from '@/components/properties/PropertiesViewToggle'

export const metadata = {
  title: 'Properties | 4Rivers Realty',
  description: 'Browse horse farms, ranches, and land in Ocala & Sumter County, FL',
}

export default async function PropertiesPage() {
  const t = await getTranslations('properties')

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-dark-navy pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="font-barlow text-brand-blue text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            {t('eyebrow')}
          </p>
          <h1 className="font-cormorant text-4xl text-white">{t('title')}</h1>
          <p className="font-barlow text-white/60 mt-2">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyFilters />
          <PropertiesViewToggle />
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
