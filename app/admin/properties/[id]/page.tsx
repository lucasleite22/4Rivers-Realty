'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Pencil, Check, X, Trash2, Upload, Star, ImageIcon,
  MapPin, Ruler, Building2, DollarSign, Calendar, Globe, AlertTriangle,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface PropertyImage {
  id: string
  url: string
  isCover: boolean
  sortOrder: number
}

interface Property {
  id: string
  title: string
  type: string
  status: string
  priceUsd: string
  acreage: string
  county: string
  city: string
  address: string
  description: string
  featured: boolean
  showOnPortal: boolean
  stables: number | null
  arenas: number | null
  pastures: number | null
  latitude: number | null
  longitude: number | null
  mlsId: string | null
  createdAt: string
  updatedAt: string
  images: PropertyImage[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  HORSE_FARM: 'Horse Farm', RANCH: 'Ranch', RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial', LAND: 'Land',
}
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  SOLD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  UNDER_CONTRACT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const SOURCE_TAG: Record<string, { label: string; color: string }> = {
  AGENT:  { label: '🏢 Agent',  color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  MLS:    { label: '🔗 MLS',    color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  CLIENT: { label: '👤 Client', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
}

const INPUT = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50'
const LABEL = 'font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest block mb-1.5'

function fmt(price: string | number | { toString(): string }) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(price))
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [coverIdx, setCoverIdx] = useState(0)
  const [error, setError] = useState('')
  const [togglingField, setTogglingField] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<Property>>({})

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/properties/${params.id}`)
      if (!res.ok) { router.push('/admin/properties'); return }
      const data: Property = await res.json()
      setProperty(data)
      setForm(data)
      setCoverIdx(data.images.findIndex((i) => i.isCover) ?? 0)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => { load() }, [load])

  // ── Edit helpers ──────────────────────────────────────────────────────────

  function setF(field: string, value: unknown) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function cancelEdit() {
    setForm(property ?? {})
    setEditing(false)
    setError('')
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        form.title,
          type:         form.type,
          status:       form.status,
          priceUsd:     Number(form.priceUsd),
          acreage:      Number(form.acreage),
          county:       form.county,
          city:         form.city,
          address:      form.address,
          description:  form.description,
          featured:     form.featured,
          showOnPortal: form.showOnPortal,
          stables:      form.stables  != null ? Number(form.stables)  : null,
          arenas:       form.arenas   != null ? Number(form.arenas)   : null,
          pastures:     form.pastures != null ? Number(form.pastures) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated: Property = await res.json()
      setProperty(updated)
      setForm(updated)
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // ── Image helpers ─────────────────────────────────────────────────────────

  async function uploadImages(files: FileList | null) {
    if (!files || !property) return
    setUploadingImg(true)
    for (const file of Array.from(files).slice(0, 20)) {
      if (!file.type.startsWith('image/')) continue
      const fd = new FormData()
      fd.append('file', file)
      await fetch(`/api/properties/${property.id}/images`, { method: 'POST', body: fd })
    }
    await load()
    setUploadingImg(false)
  }

  async function deleteImage(imageId: string) {
    if (!property) return
    await fetch(`/api/properties/${property.id}/images?imageId=${imageId}`, { method: 'DELETE' })
    await load()
  }

  // ── Visibility quick-toggle (saves immediately, no edit mode required) ───────

  async function toggleVisibility(field: 'featured' | 'showOnPortal') {
    if (!property) return
    const newVal = !property[field]
    // Optimistic update
    setProperty((p) => p ? { ...p, [field]: newVal } : p)
    setForm((p) => ({ ...p, [field]: newVal }))
    setTogglingField(field)
    try {
      await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newVal }),
      })
    } catch {
      // revert on failure
      setProperty((p) => p ? { ...p, [field]: !newVal } : p)
      setForm((p) => ({ ...p, [field]: !newVal }))
    } finally {
      setTogglingField(null)
    }
  }

  // ── Delete property ───────────────────────────────────────────────────────

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/properties/${params.id}`, { method: 'DELETE' })
    router.push('/admin/properties')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-full bg-[#0a1929] p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!property) return null

  const displayImages = property.images

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/properties"
              className="flex items-center gap-1.5 font-barlow text-sm text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Properties
            </Link>
            <span className="text-white/20">/</span>
            <span className="font-barlow text-sm text-white/60 truncate max-w-xs">{property.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {(() => {
              const src = SOURCE_TAG[(property as any).source] ?? SOURCE_TAG.AGENT
              return (
                <span className={`font-barlow text-xs font-semibold px-3 py-1 rounded-full border ${src.color}`}>
                  {src.label}
                </span>
              )
            })()}
            <span className={`font-barlow text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[property.status] ?? ''}`}>
              {property.status.replace('_', ' ')}
            </span>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white font-barlow font-semibold text-sm rounded-lg hover:bg-white/15 transition">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : (
              <>
                <button onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white/70 font-barlow font-semibold text-sm rounded-lg hover:bg-white/15 transition">
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-dark font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 font-barlow text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Title (editable) ── */}
        {editing ? (
          <input
            value={String(form.title ?? '')}
            onChange={(e) => setF('title', e.target.value)}
            className="w-full font-cormorant text-3xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-cyan-500 pb-1 mb-6"
          />
        ) : (
          <h1 className="font-cormorant text-3xl font-bold mb-6">{property.title}</h1>
        )}

        {/* ── Images ── */}
        <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest">
              Photos ({displayImages.length})
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/60 font-barlow text-xs font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadingImg ? 'Uploading…' : 'Add Photos'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => uploadImages(e.target.files)} />
          </div>

          {displayImages.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-12 text-center cursor-pointer hover:bg-white/3 transition-colors"
            >
              <ImageIcon className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="font-barlow text-sm text-white/30">No photos yet. Click to upload.</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Main cover */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
                <img
                  src={displayImages[coverIdx]?.url ?? displayImages[0]?.url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-barlow text-xs text-white font-semibold">Cover</span>
                </div>
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {displayImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                      ${idx === coverIdx ? 'border-cyan-500' : 'border-transparent hover:border-white/30'}`}
                    onClick={() => setCoverIdx(idx)}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteImage(img.id) }}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-500/40 transition-colors"
                >
                  <Upload className="w-4 h-4 text-white/20" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Main details ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Left: core fields */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest">Property Details</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Type</label>
                {editing ? (
                  <select value={String(form.type ?? '')} onChange={(e) => setF('type', e.target.value)} className={INPUT + ' bg-transparent'}>
                    {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <p className="font-barlow text-sm text-white">{TYPE_LABEL[property.type] ?? property.type}</p>
                )}
              </div>
              <div>
                <label className={LABEL}>Status</label>
                {editing ? (
                  <select value={String(form.status ?? '')} onChange={(e) => setF('status', e.target.value)} className={INPUT + ' bg-transparent'}>
                    <option value="ACTIVE">Active</option>
                    <option value="UNDER_CONTRACT">Under Contract</option>
                    <option value="SOLD">Sold</option>
                  </select>
                ) : (
                  <p className="font-barlow text-sm text-white">{property.status.replace('_', ' ')}</p>
                )}
              </div>
              <div>
                <label className={LABEL}>Price (USD)</label>
                {editing ? (
                  <input type="number" min="0" value={String(form.priceUsd ?? '')} onChange={(e) => setF('priceUsd', e.target.value)} className={INPUT} />
                ) : (
                  <p className="font-barlow text-sm font-semibold text-white">{fmt(property.priceUsd)}</p>
                )}
              </div>
              <div>
                <label className={LABEL}>Acreage</label>
                {editing ? (
                  <input type="number" min="0" step="0.01" value={String(form.acreage ?? '')} onChange={(e) => setF('acreage', e.target.value)} className={INPUT} />
                ) : (
                  <p className="font-barlow text-sm text-white">{Number(property.acreage).toLocaleString()} acres</p>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 grid grid-cols-1 gap-4">
              <div>
                <label className={LABEL}>Full Address</label>
                {editing ? (
                  <input value={String(form.address ?? '')} onChange={(e) => setF('address', e.target.value)} className={INPUT} />
                ) : (
                  <p className="font-barlow text-sm text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    {property.address}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>City</label>
                  {editing ? (
                    <input value={String(form.city ?? '')} onChange={(e) => setF('city', e.target.value)} className={INPUT} />
                  ) : (
                    <p className="font-barlow text-sm text-white">{property.city}</p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>County</label>
                  {editing ? (
                    <input value={String(form.county ?? '')} onChange={(e) => setF('county', e.target.value)} className={INPUT} />
                  ) : (
                    <p className="font-barlow text-sm text-white">{property.county}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <label className={LABEL}>Description</label>
              {editing ? (
                <textarea rows={5} value={String(form.description ?? '')} onChange={(e) => setF('description', e.target.value)}
                  className={INPUT + ' resize-none'} />
              ) : (
                <p className="font-barlow text-sm text-white/70 leading-relaxed whitespace-pre-line">{property.description}</p>
              )}
            </div>
          </div>

          {/* Right: extras */}
          <div className="space-y-5">
            {/* Equestrian */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Equestrian</p>
              {(['stables', 'arenas', 'pastures'] as const).map((field) => (
                <div key={field} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="font-barlow text-sm text-white/50 capitalize">{field}</span>
                  {editing ? (
                    <input type="number" min="0"
                      value={form[field] != null ? String(form[field]) : ''}
                      onChange={(e) => setF(field, e.target.value === '' ? null : Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded font-barlow text-sm text-white text-right focus:outline-none focus:border-cyan-500/50" />
                  ) : (
                    <span className="font-barlow text-sm font-semibold text-white">
                      {property[field] ?? <span className="text-white/30">—</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Visibility */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Visibility</p>
              {([['featured', 'Featured on homepage'], ['showOnPortal', 'Show on portal']] as const).map(([field, label]) => {
                const active = editing ? !!form[field] : !!property[field]
                return (
                  <label key={field} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 cursor-pointer">
                    <span className="font-barlow text-sm text-white/60">{label}</span>
                    <button
                      type="button"
                      onClick={() => editing ? setF(field, !form[field]) : toggleVisibility(field)}
                      disabled={togglingField === field}
                      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 focus:outline-none cursor-pointer
                        ${active ? 'bg-cyan-500' : 'bg-white/10'}
                        ${togglingField === field ? 'opacity-50' : 'hover:opacity-80'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                        ${active ? 'left-5' : 'left-1'}`} />
                    </button>
                  </label>
                )
              })}
            </div>

            {/* Meta */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Meta</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-barlow text-xs text-white/40">ID</span>
                  <span className="font-barlow text-xs text-white/60 font-mono">{property.id.slice(0, 12)}…</span>
                </div>
                {property.mlsId && (
                  <div className="flex justify-between">
                    <span className="font-barlow text-xs text-white/40">MLS ID</span>
                    <span className="font-barlow text-xs text-white/60">{property.mlsId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-barlow text-xs text-white/40">Created</span>
                  <span className="font-barlow text-xs text-white/60">
                    {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-barlow text-xs text-white/40">Updated</span>
                  <span className="font-barlow text-xs text-white/60">
                    {new Date(property.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <p className="font-barlow text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-3">Danger Zone</p>
          {!confirmDelete ? (
            <div className="flex items-center justify-between">
              <p className="font-barlow text-sm text-white/50">Permanently delete this property and all its images.</p>
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 font-barlow font-semibold text-sm rounded-lg hover:bg-red-500/20 transition border border-red-500/20">
                <Trash2 className="w-3.5 h-3.5" />
                Delete Property
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="font-barlow text-sm text-red-300 font-semibold">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-white/5 text-white/60 font-barlow font-semibold text-sm rounded-lg hover:bg-white/10 transition">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-barlow font-semibold text-sm rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
