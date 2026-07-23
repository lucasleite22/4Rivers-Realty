'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'

const TYPE_VALUES = ['', 'HORSE_FARM', 'RANCH', 'LAND', 'RESIDENTIAL', 'COMMERCIAL'] as const
const COUNTY_VALUES = ['', 'Marion', 'Sumter'] as const

export default function PropertyFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const tTypes = useTranslations('propertyTypes')
  const tCounties = useTranslations('propertyCounties')
  const t = useTranslations('propertyFilters')

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('page')
      router.push(`/properties?${next.toString()}`)
    },
    [params, router]
  )

  const selectCls =
    'font-barlow text-sm border border-navy/20 rounded-lg px-3 py-2 bg-white text-navy focus:outline-none focus:border-brand-blue w-full sm:w-auto'
  const inputCls =
    'font-barlow text-sm border border-navy/20 rounded-lg px-3 py-2 bg-white text-navy focus:outline-none focus:border-brand-blue w-full sm:w-32'

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
      <select
        value={params.get('type') ?? ''}
        onChange={(e) => update('type', e.target.value)}
        className={`${selectCls} col-span-2`}
      >
        {TYPE_VALUES.map((value) => (
          <option key={value} value={value}>
            {tTypes(value === '' ? 'all' : (value as 'HORSE_FARM' | 'RANCH' | 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND'))}
          </option>
        ))}
      </select>

      <select
        value={params.get('county') ?? ''}
        onChange={(e) => update('county', e.target.value)}
        className={`${selectCls} col-span-2`}
      >
        {COUNTY_VALUES.map((value) => (
          <option key={value} value={value}>
            {tCounties(value === '' ? 'all' : (value.toUpperCase() as 'MARION' | 'SUMTER'))}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder={t('minPrice')}
        defaultValue={params.get('minPrice') ?? ''}
        onBlur={(e) => update('minPrice', e.target.value)}
        className={inputCls}
      />

      <input
        type="number"
        placeholder={t('maxPrice')}
        defaultValue={params.get('maxPrice') ?? ''}
        onBlur={(e) => update('maxPrice', e.target.value)}
        className={inputCls}
      />

      <input
        type="number"
        placeholder={t('minAcres')}
        defaultValue={params.get('minAcreage') ?? ''}
        onBlur={(e) => update('minAcreage', e.target.value)}
        className={`${inputCls} col-span-2 sm:w-28`}
      />
    </div>
  )
}
