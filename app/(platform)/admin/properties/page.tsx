'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Download, Plus, MapPin, Ruler, Check, ImageOff, LayoutList, Map as MapIcon } from 'lucide-react'
import PropertyMap from '@/components/map/PropertyMap'

interface PropertyImage {
  url: string
  isCover: boolean
  sortOrder: number
}

interface Property {
  id: string
  title: string
  type: string
  status: string
  source: string
  showOnPortal: boolean
  priceUsd: string
  acreage: string
  city: string
  county: string
  featured: boolean
  isLaunch: boolean
  launchBadge: string | null
  createdAt: string
  latitude: number | null
  longitude: number | null
  images: PropertyImage[]
}

const SOURCE_FILTERS = [
  { value: '', label: 'All sources' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'MLS', label: 'MLS' },
  { value: 'CLIENT', label: 'Client' },
] as const

const TYPE_COLOR: Record<string, string> = {
  HORSE_FARM:  'bg-amber-100 text-amber-700',
  RANCH:       'bg-green-100 text-green-700',
  RESIDENTIAL: 'bg-blue-100 text-blue-700',
  COMMERCIAL:  'bg-purple-100 text-purple-700',
  LAND:        'bg-lime-100 text-lime-700',
}

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'HORSE_FARM', label: 'Horse Farm' },
  { value: 'RANCH', label: 'Ranch' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
] as const

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:         'bg-green-500/20 text-green-400',
  SOLD:           'bg-gray-500/20 text-gray-400',
  UNDER_CONTRACT: 'bg-yellow-500/20 text-yellow-400',
}

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UNDER_CONTRACT', label: 'Under Contract' },
  { value: 'SOLD', label: 'Sold' },
] as const

const PORTAL_FILTERS = [
  { value: '', label: 'All listings' },
  { value: 'true', label: 'Live on site' },
  { value: 'false', label: 'Pending review' },
] as const

function coverThumb(p: Property): string | null {
  const cover = p.images.find((img) => img.isCover) ?? p.images[0]
  return cover?.url ?? null
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
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [portalFilter, setPortalFilter] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [publishing, setPublishing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  function load() {
    setLoading(true)
    const qs = new URLSearchParams({ all: 'true' })
    if (sourceFilter) qs.set('source', sourceFilter)
    if (portalFilter) qs.set('showOnPortal', portalFilter)
    fetch(`/api/properties?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => setProperties(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    setSelected(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter, portalFilter])

  const filtered = properties.filter((p) => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.county.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || p.type === typeFilter
    const matchesStatus = !statusFilter || p.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function publishSelected() {
    if (selected.size === 0) return
    setPublishing(true)
    try {
      await fetch('/api/properties/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), showOnPortal: true }),
      })
      setSelected(new Set())
      load()
    } finally {
      setPublishing(false)
    }
  }

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

      {/* Search + filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, city or county…"
          className="w-full max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-blue/50"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
        >
          {SOURCE_FILTERS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#0a1929]">{f.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
        >
          {TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#0a1929]">{f.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#0a1929]">{f.label}</option>
          ))}
        </select>
        <select
          value={portalFilter}
          onChange={(e) => setPortalFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
        >
          {PORTAL_FILTERS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#0a1929]">{f.label}</option>
          ))}
        </select>

        {selected.size > 0 && (
          <button
            onClick={publishSelected}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500/90 text-white font-barlow font-semibold text-sm rounded-lg hover:bg-green-500 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {publishing ? 'Publishing…' : `Publish ${selected.size} selected`}
          </button>
        )}

        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-barlow text-xs font-semibold transition-colors ${
              viewMode === 'list' ? 'bg-brand-blue text-dark-navy' : 'text-white/50 hover:text-white'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-barlow text-xs font-semibold transition-colors ${
              viewMode === 'map' ? 'bg-brand-blue text-dark-navy' : 'text-white/50 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Map
          </button>
        </div>
      </div>

      {/* List / Map */}
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
      ) : viewMode === 'map' ? (
        <PropertyMap
          properties={filtered
            .filter((p) => p.latitude != null && p.longitude != null)
            .map((p) => ({
              id: p.id,
              title: p.title,
              city: p.city,
              county: p.county,
              acreage: p.acreage,
              priceUsd: p.priceUsd,
              latitude: p.latitude,
              longitude: p.longitude,
              coverImageUrl: coverThumb(p),
            }))}
          height="h-[600px]"
          detailsBasePath="/admin/properties"
        />
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((p) => selected.has(p.id))}
                      onChange={(e) =>
                        setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())
                      }
                      className="accent-brand-blue"
                    />
                  </th>
                  <th className="px-5 py-3 w-28" />
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
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelected(p.id)}
                        className="accent-brand-blue"
                      />
                    </td>
                    <td className="px-5 py-4">
                      {coverThumb(p) ? (
                        <Image
                          src={coverThumb(p)!}
                          alt=""
                          width={96}
                          height={72}
                          className="w-24 h-[4.5rem] rounded-lg object-cover bg-white/5"
                        />
                      ) : (
                        <div className="w-24 h-[4.5rem] rounded-lg bg-white/5 flex items-center justify-center">
                          <ImageOff className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-barlow font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            {p.title}
                            {p.isLaunch && (
                              <span className="font-barlow text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue">
                                {p.launchBadge ?? 'New Launch'}
                              </span>
                            )}
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
                          <span className="flex items-center gap-1.5">
                            <span className={`font-barlow text-xs font-semibold px-2.5 py-1 rounded-full ${src.color}`}>
                              {src.label}
                            </span>
                            {!p.showOnPortal && (
                              <span className="font-barlow text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                                Hidden
                              </span>
                            )}
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
