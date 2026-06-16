'use client'

import { useState } from 'react'

export interface LotData {
  bedrooms: string
  bathrooms: string
  sqft: string
  garages: string
  yearBuilt: string
  pool: boolean
  hoaFee: string
}

interface Props {
  value?: Partial<LotData>
  onChange?: (data: LotData) => void
}

const DEFAULTS: LotData = {
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  garages: '',
  yearBuilt: '',
  pool: false,
  hoaFee: '',
}

export default function LotFields({ value, onChange }: Props) {
  const [data, setData] = useState<LotData>({ ...DEFAULTS, ...value })

  function update<K extends keyof LotData>(key: K, val: LotData[K]) {
    const next = { ...data, [key]: val }
    setData(next)
    onChange?.(next)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-cormorant text-xl text-navy">Residential / Commercial Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Bedrooms">
          <input type="number" value={data.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Bathrooms">
          <input type="number" value={data.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Sq Ft">
          <input type="number" value={data.sqft} onChange={(e) => update('sqft', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Garages">
          <input type="number" value={data.garages} onChange={(e) => update('garages', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Year Built">
          <input type="number" value={data.yearBuilt} onChange={(e) => update('yearBuilt', e.target.value)} className={inputCls} placeholder="e.g. 2005" />
        </Field>
        <Field label="HOA Fee / mo">
          <input type="number" value={data.hoaFee} onChange={(e) => update('hoaFee', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
      </div>
      <label className="flex items-center gap-2 font-barlow text-sm text-navy cursor-pointer">
        <input
          type="checkbox"
          checked={data.pool}
          onChange={(e) => update('pool', e.target.checked)}
          className="accent-cyan-brand"
        />
        Has Pool
      </label>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-barlow text-sm text-navy/70 block mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-navy/20 rounded-lg px-3 py-2 font-barlow text-navy focus:outline-none focus:border-cyan-brand'
