'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'HORSE_FARM', label: 'Horse Farm' },
  { value: 'RANCH', label: 'Ranch' },
  { value: 'LAND', label: 'Land' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
]

const COUNTIES = [
  { value: '', label: 'All Counties' },
  { value: 'Marion', label: 'Marion County' },
  { value: 'Sumter', label: 'Sumter County' },
]

export default function PropertyFilters() {
  const router = useRouter()
  const params = useSearchParams()

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
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <select
        value={params.get('county') ?? ''}
        onChange={(e) => update('county', e.target.value)}
        className={`${selectCls} col-span-2`}
      >
        {COUNTIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Min price"
        defaultValue={params.get('minPrice') ?? ''}
        onBlur={(e) => update('minPrice', e.target.value)}
        className={inputCls}
      />

      <input
        type="number"
        placeholder="Max price"
        defaultValue={params.get('maxPrice') ?? ''}
        onBlur={(e) => update('maxPrice', e.target.value)}
        className={inputCls}
      />

      <input
        type="number"
        placeholder="Min acres"
        defaultValue={params.get('minAcreage') ?? ''}
        onBlur={(e) => update('minAcreage', e.target.value)}
        className={`${inputCls} col-span-2 sm:w-28`}
      />
    </div>
  )
}
