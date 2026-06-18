'use client'

import { useState } from 'react'

export interface FarmData {
  barns: string
  ponds: string
  fencing: string
  soilType: string
  irrigated: boolean
  cropReady: boolean
}

interface Props {
  value?: Partial<FarmData>
  onChange?: (data: FarmData) => void
}

const DEFAULTS: FarmData = {
  barns: '',
  ponds: '',
  fencing: '',
  soilType: '',
  irrigated: false,
  cropReady: false,
}

export default function FarmFields({ value, onChange }: Props) {
  const [data, setData] = useState<FarmData>({ ...DEFAULTS, ...value })

  function update<K extends keyof FarmData>(key: K, val: FarmData[K]) {
    const next = { ...data, [key]: val }
    setData(next)
    onChange?.(next)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-cormorant text-xl text-navy">Ranch / Land Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barns">
          <input type="number" value={data.barns} onChange={(e) => update('barns', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Ponds">
          <input type="number" value={data.ponds} onChange={(e) => update('ponds', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Fencing (miles)">
          <input type="number" value={data.fencing} onChange={(e) => update('fencing', e.target.value)} className={inputCls} placeholder="0" />
        </Field>
        <Field label="Soil Type">
          <input type="text" value={data.soilType} onChange={(e) => update('soilType', e.target.value)} className={inputCls} placeholder="e.g. Sandy loam" />
        </Field>
      </div>
      <div className="space-y-2">
        {(
          [
            ['irrigated', 'Has Irrigation'],
            ['cropReady', 'Crop Ready'],
          ] as [keyof FarmData, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 font-barlow text-sm text-navy cursor-pointer">
            <input
              type="checkbox"
              checked={data[key] as boolean}
              onChange={(e) => update(key, e.target.checked as FarmData[typeof key])}
              className="accent-brand-blue"
            />
            {label}
          </label>
        ))}
      </div>
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
  'w-full border border-navy/20 rounded-lg px-3 py-2 font-barlow text-navy focus:outline-none focus:border-brand-blue'
