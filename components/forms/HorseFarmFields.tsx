'use client'

import { useState } from 'react'

export interface HorseFarmData {
  stables: string
  arenas: string
  pastures: string
  tackRooms: string
  paddocks: string
  wateredPastures: boolean
  arenaLighting: boolean
  irrigationSystem: boolean
}

interface Props {
  value?: Partial<HorseFarmData>
  onChange?: (data: HorseFarmData) => void
}

const DEFAULTS: HorseFarmData = {
  stables: '',
  arenas: '',
  pastures: '',
  tackRooms: '',
  paddocks: '',
  wateredPastures: false,
  arenaLighting: false,
  irrigationSystem: false,
}

export default function HorseFarmFields({ value, onChange }: Props) {
  const [data, setData] = useState<HorseFarmData>({ ...DEFAULTS, ...value })

  function update<K extends keyof HorseFarmData>(key: K, val: HorseFarmData[K]) {
    const next = { ...data, [key]: val }
    setData(next)
    onChange?.(next)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-cormorant text-xl text-navy">Horse Farm Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Stables / Stalls">
          <input
            type="number"
            value={data.stables}
            onChange={(e) => update('stables', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
        <Field label="Arenas">
          <input
            type="number"
            value={data.arenas}
            onChange={(e) => update('arenas', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
        <Field label="Pastures">
          <input
            type="number"
            value={data.pastures}
            onChange={(e) => update('pastures', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
        <Field label="Tack Rooms">
          <input
            type="number"
            value={data.tackRooms}
            onChange={(e) => update('tackRooms', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
        <Field label="Paddocks">
          <input
            type="number"
            value={data.paddocks}
            onChange={(e) => update('paddocks', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
      </div>
      <div className="space-y-2">
        {(
          [
            ['wateredPastures', 'Watered Pastures'],
            ['arenaLighting', 'Arena Lighting'],
            ['irrigationSystem', 'Irrigation System'],
          ] as [keyof HorseFarmData, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 font-barlow text-sm text-navy cursor-pointer">
            <input
              type="checkbox"
              checked={data[key] as boolean}
              onChange={(e) => update(key, e.target.checked as HorseFarmData[typeof key])}
              className="accent-cyan-brand"
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
  'w-full border border-navy/20 rounded-lg px-3 py-2 font-barlow text-navy focus:outline-none focus:border-cyan-brand'
