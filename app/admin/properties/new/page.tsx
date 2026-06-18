'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PreviewFile {
  file: File
  objectUrl: string
}

type Status = 'idle' | 'loading' | 'error'

const INPUT = 'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/30'
const LABEL = 'font-barlow text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5'

export default function NewPropertyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState<PreviewFile[]>([])

  const [form, setForm] = useState({
    title: '',
    type: '',
    status: 'ACTIVE',
    priceUsd: '',
    acreage: '',
    county: '',
    city: '',
    address: '',
    description: '',
    featured: true,
    showOnPortal: true,
    stables: '',
    arenas: '',
    pastures: '',
  })

  function set(field: string, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 20 - previews.length)
    setPreviews((prev) => [
      ...prev,
      ...incoming.map((file) => ({ file, objectUrl: URL.createObjectURL(file) })),
    ])
  }

  function removePreview(idx: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].objectUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')

    try {
      // 1. Create property
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title,
          type:        form.type,
          status:      form.status,
          priceUsd:    Number(form.priceUsd),
          acreage:     Number(form.acreage),
          county:      form.county,
          city:        form.city,
          address:     form.address,
          description: form.description,
          featured:    form.featured,
          showOnPortal:form.showOnPortal,
          stables:     form.stables  ? Number(form.stables)  : undefined,
          arenas:      form.arenas   ? Number(form.arenas)   : undefined,
          pastures:    form.pastures ? Number(form.pastures) : undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create property')
      }

      const property = await res.json()

      // 2. Upload images sequentially
      for (const preview of previews) {
        const fd = new FormData()
        fd.append('file', preview.file)
        await fetch(`/api/properties/${property.id}/images`, { method: 'POST', body: fd })
        URL.revokeObjectURL(preview.objectUrl)
      }

      router.push('/admin/properties')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/properties"
            className="flex items-center gap-1.5 font-barlow text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="font-cormorant text-3xl font-bold">New Property</h1>
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-5 py-4 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-barlow text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={LABEL}>Title *</label>
                <input required value={form.title} onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Stunning 50-Acre Horse Farm"
                  className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Type *</label>
                <select required value={form.type} onChange={(e) => set('type', e.target.value)}
                  className={INPUT + ' bg-transparent'}>
                  <option value="">Select type…</option>
                  {[['HORSE_FARM','Horse Farm'],['RANCH','Ranch'],['RESIDENTIAL','Residential'],['COMMERCIAL','Commercial'],['LAND','Land']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)}
                  className={INPUT + ' bg-transparent'}>
                  <option value="ACTIVE">Active</option>
                  <option value="UNDER_CONTRACT">Under Contract</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Price (USD) *</label>
                <input required type="number" min="0" value={form.priceUsd} onChange={(e) => set('priceUsd', e.target.value)}
                  placeholder="e.g. 1500000"
                  className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Acreage *</label>
                <input required type="number" min="0" step="0.01" value={form.acreage} onChange={(e) => set('acreage', e.target.value)}
                  placeholder="e.g. 50"
                  className={INPUT} />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>County *</label>
                <input required value={form.county} onChange={(e) => set('county', e.target.value)}
                  placeholder="e.g. Marion" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>City *</label>
                <input required value={form.city} onChange={(e) => set('city', e.target.value)}
                  placeholder="e.g. Ocala" className={INPUT} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL}>Full Address *</label>
                <input required value={form.address} onChange={(e) => set('address', e.target.value)}
                  placeholder="Street address" className={INPUT} />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">Description</p>
            <textarea required rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the property in detail…"
              className={INPUT + ' resize-none'} />
          </section>

          {/* Equestrian Features */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">Equestrian Features (optional)</p>
            <div className="grid grid-cols-3 gap-5">
              {(['stables','arenas','pastures'] as const).map((field) => (
                <div key={field}>
                  <label className={LABEL}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input type="number" min="0" value={form[field]} onChange={(e) => set(field, e.target.value)}
                    placeholder="0" className={INPUT} />
                </div>
              ))}
            </div>
          </section>

          {/* Visibility */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">Visibility</p>
            <div className="flex flex-col gap-3">
              {([['featured','Featured on homepage'] as const, ['showOnPortal','Show on properties portal'] as const]).map(([field, label]) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer">
                  <div
                    role="checkbox"
                    aria-checked={!!form[field]}
                    onClick={() => set(field, !form[field])}
                    className={`w-10 h-6 rounded-full transition-colors ${form[field] ? 'bg-brand-blue' : 'bg-white/10'} relative flex-shrink-0`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[field] ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="font-barlow text-sm text-white/70">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-barlow text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Photos</p>
            <p className="font-barlow text-xs text-white/30 mb-4">Up to 20 photos · JPG, PNG, WebP · Max 5 MB each · First photo is cover</p>

            {previews.length < 20 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-brand-blue/40 hover:bg-white/3 transition-colors mb-4"
              >
                <Upload className="w-7 h-7 text-white/20 mx-auto mb-2" />
                <p className="font-barlow text-sm text-white/30">
                  <span className="text-cyan-400 font-semibold">Click to upload</span> or drag & drop
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
              </div>
            )}

            {previews.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img src={p.objectUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePreview(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 font-barlow text-[10px] bg-brand-blue/80 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                {previews.length < 20 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center hover:border-brand-blue/40 transition-colors">
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/admin/properties"
              className="px-6 py-2.5 bg-white/5 text-white/70 font-barlow font-semibold text-sm rounded-lg hover:bg-white/10 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-2.5 bg-brand-blue text-dark-navy font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {status === 'loading' ? (previews.length > 0 ? 'Uploading…' : 'Creating…') : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
