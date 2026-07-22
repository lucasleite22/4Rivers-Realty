'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Download, Plus, MapPin, Ruler } from 'lucide-react'

interface Property {
  id: string
  title: string
  type: string
  status: string
  source: string
  priceUsd: string
  acreage: string
  city: string
  county: string
  featured: boolean
  createdAt: string
}

const TYPE_COLOR: Record<string, string> = {
  HORSE_FARM:  'bg-amber-100 text-amber-700',
  RANCH:       'bg-green-100 text-green-700',
  RESIDENTIAL: 'bg-blue-100 text-blue-700',
  COMMERCIAL:  'bg-purple-100 text-purple-700',
  LAND:        'bg-lime-100 text-lime-700',
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:         'bg-green-500/20 text-green-400',
  SOLD:           'bg-gray-500/20 text-gray-400',
  UNDER_CONTRACT: 'bg-yellow-500/20 text-yellow-400',
}

const SOURCE_TAG: Record<string, { label: string; color: string }> = {
  AGENT:  { label: 'Agent',  color: 'bg-blue-500/15 text-blue-400' },
  MLS:    { label: 'MLS',    color: 'bg-purple-500/15 text-purple-400' },
  CLIENT: { label: 'Client', color: 'bg-amber-500/15 text-amber-400' },
}

function fmt(price: string | number | { toString(): string }) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(price))
}

export default function AdminPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/properties?limit=50')
      .then((r) => r.json())
      .then((d) => setProperties(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = properties.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.county.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-bold">Properties</h1>
          <p className="font-barlow text-white/40 text-sm mt-1">{properties.length} total listings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open('/api/export/properties', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-barlow font-semibold text-sm rounded-lg hover:bg-white/15 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link href="/admin/properties/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-dark-navy font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition">
            <Plus className="w-4 h-4" />
            New Property
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, city or county…"
          className="w-full max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-blue/50"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 text-center">
          <p className="font-barlow text-white/30">No properties found.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Property', 'Type', 'Status', 'Source', 'Price', 'Location', 'Added'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/admin/properties/${p.id}`)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-barlow font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                            {p.title}
                          </p>
                          <p className="font-barlow text-xs text-white/30 flex items-center gap-1 mt-0.5">
                            <Ruler className="w-3 h-3" />
                            {Number(p.acreage).toLocaleString()} acres
                            {p.featured && <span className="ml-2 text-yellow-400">★ Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-barlow text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLOR[p.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-barlow text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] ?? ''}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const src = SOURCE_TAG[p.source] ?? SOURCE_TAG.AGENT
                        return (
                          <span className={`font-barlow text-xs font-semibold px-2.5 py-1 rounded-full ${src.color}`}>
                            {src.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-5 py-4 font-barlow font-semibold text-sm text-white">
                      {fmt(p.priceUsd)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 font-barlow text-xs text-white/50">
                        <MapPin className="w-3 h-3" />
                        {p.city}, {p.county}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-barlow text-xs text-white/30">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
