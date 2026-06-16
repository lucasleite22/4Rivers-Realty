'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Ruler, Phone, Mail, Calendar, CheckCircle,
  ExternalLink, ImageIcon, AlertCircle, Clock, RefreshCw,
} from 'lucide-react'

interface SellerLead {
  id: string
  name: string
  email: string | null
  phone: string | null
  propertyInterest: string | null
  budgetUsd: string | null
  notes: string | null
  status: string
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: 'NEW_LEAD',  label: 'Pending',     color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'CONTACTED', label: 'In Review',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'CLOSED_WON', label: 'Approved',   color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'CLOSED_LOST', label: 'Declined',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
]

function parseLine(notes: string, key: string) {
  const match = notes.split('\n').find((l) => l.toLowerCase().startsWith(key.toLowerCase() + ':'))
  return match ? match.slice(key.length + 1).trim() : ''
}

function parseAttachments(notes: string): string[] {
  const idx = notes.indexOf('Attachments:')
  if (idx === -1) return []
  return notes.slice(idx + 'Attachments:'.length).split('\n')
    .map((l) => l.trim()).filter((l) => l.startsWith('/uploads/'))
}

function statusBadge(status: string) {
  const s = STATUS_OPTIONS.find((o) => o.value === status)
  return s ?? { label: status, color: 'bg-white/10 text-white/40 border-white/10' }
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<SellerLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('NEW_LEAD')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads?type=SELLER&limit=50${filter ? `&status=${filter}` : ''}`)
      const data = await res.json()
      setLeads(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  async function approve(leadId: string) {
    setApprovingId(leadId)
    setError('')
    try {
      const res = await fetch('/api/admin/approve-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      router.push(`/admin/properties/${data.propertyId}`)
    } catch (e: any) {
      setError(e.message)
      setApprovingId(null)
    }
  }

  const counts = {
    NEW_LEAD: leads.length, // shown when filter active
  }

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-bold">Property Submissions</h1>
          <p className="font-barlow text-white/40 text-sm mt-1">
            Properties submitted by clients via the website
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-white/60 font-barlow text-sm rounded-lg hover:bg-white/10 transition">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full font-barlow text-sm font-semibold transition border
              ${filter === opt.value ? opt.color : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-1.5 rounded-full font-barlow text-sm font-semibold transition border
            ${filter === '' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
        >
          All
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-5 font-barlow text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-16 text-center">
          <CheckCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="font-barlow text-white/30">No submissions in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const notes = lead.notes ?? ''
            const address  = parseLine(notes, 'Address')
            const county   = parseLine(notes, 'County')
            const type     = parseLine(notes, 'Type')
            const acreage  = parseLine(notes, 'Acreage')
            const asking   = parseLine(notes, 'Asking')
            const details  = parseLine(notes, 'Details')
            const images   = parseAttachments(notes)
            const badge    = statusBadge(lead.status)

            return (
              <div key={lead.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left: thumbnail strip */}
                  {images.length > 0 ? (
                    <div className="md:w-52 flex-shrink-0">
                      <div className="h-40 md:h-full relative bg-white/5">
                        <img src={images[0]} alt="" className="w-full h-full object-cover" />
                        {images.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black/70 font-barlow text-xs text-white px-2 py-0.5 rounded-full">
                            +{images.length - 1} photos
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="md:w-52 flex-shrink-0 h-40 md:h-auto bg-white/3 flex items-center justify-center border-r border-white/5">
                      <ImageIcon className="w-8 h-8 text-white/10" />
                    </div>
                  )}

                  {/* Right: content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-barlow text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="font-barlow text-xs text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-cormorant font-bold text-xl text-white">
                          {type && <span className="text-cyan-400">{type} · </span>}
                          {address || lead.propertyInterest || 'Property Submission'}
                        </h3>
                      </div>
                    </div>

                    {/* Property info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {county && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="font-barlow text-xs text-white/60">{county}</span>
                        </div>
                      )}
                      {acreage && (
                        <div className="flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="font-barlow text-xs text-white/60">{acreage} acres</span>
                        </div>
                      )}
                      {asking && (
                        <div>
                          <span className="font-barlow text-xs font-semibold text-white">{asking}</span>
                        </div>
                      )}
                      {images.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="font-barlow text-xs text-white/60">{images.length} photo{images.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {details && (
                      <p className="font-barlow text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">
                        {details}
                      </p>
                    )}

                    {/* Submitter contact */}
                    <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-white/5">
                      <span className="font-barlow text-sm font-semibold text-white">{lead.name}</span>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 font-barlow text-xs text-white/50 hover:text-cyan-400 transition-colors">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 font-barlow text-xs text-white/50 hover:text-cyan-400 transition-colors">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {lead.status === 'NEW_LEAD' && (
                        <button
                          onClick={() => approve(lead.id)}
                          disabled={approvingId === lead.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-dark font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {approvingId === lead.id ? 'Creating…' : 'Approve → Create Listing'}
                        </button>
                      )}
                      {lead.status === 'CONTACTED' && (
                        <span className="font-barlow text-xs text-blue-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Listing created — check Properties
                        </span>
                      )}
                      <a
                        href={`/admin/leads`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-white/50 font-barlow text-sm rounded-lg hover:bg-white/10 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View in CRM
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
