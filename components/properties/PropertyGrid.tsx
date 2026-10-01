'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import PropertyCard from './PropertyCard'

export default function PropertyGrid() {
  const { properties, meta, loading, error } = useProperties()
  const t = useTranslations('propertyGrid')
  const router = useRouter()
  const params = useSearchParams()

  if (loading) return null // parent Suspense shows skeleton

  if (error) {
    return (
      <p className="font-barlow text-center text-gray-500 py-20">
        {t('error')}
      </p>
    )
  }

  if (!properties.length) {
    return (
      <p className="font-barlow text-center text-gray-400 py-20">
        {t('empty')}
      </p>
    )
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(page))
    router.push(`/properties?${next.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => goToPage(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy/20 font-barlow text-sm text-navy disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-blue transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('prevPage')}
          </button>
          <span className="font-barlow text-sm text-navy/60">
            {t('pageOf', { page: meta.page, pages: meta.pages })}
          </span>
          <button
            onClick={() => goToPage(meta.page + 1)}
            disabled={meta.page >= meta.pages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy/20 font-barlow text-sm text-navy disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-blue transition-colors"
          >
            {t('nextPage')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  )
}
