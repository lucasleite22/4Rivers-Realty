'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead, LeadStatus } from '@prisma/client'
import {
  X, Phone, Mail, MapPin, DollarSign, Ruler, Save, ChevronDown,
  ClipboardList, Clock, Download, Plus, MessageSquare, Trash2,
} from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NEW_LEAD',       label: 'New Lead',       color: 'bg-blue-100 text-blue-700' },
  { value: 'CONTACTED',      label: 'Contacted',      color: 'bg-yellow-100 text-yellow-700' },
  { value: 'SHOWING',        label: 'Showing',        color: 'bg-orange-100 text-orange-700' },
  { value: 'OFFER_MADE',     label: 'Offer Made',     color: 'bg-purple-100 text-purple-700' },
  { value: 'UNDER_CONTRACT', label: 'Under Contract', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'CLOSED_WON',     label: 'Closed Won',     color: 'bg-green-100 text-green-700' },
  { value: 'CLOSED_LOST',    label: 'Closed Lost',    color: 'bg-red-100 text-red-700' },
]

const TYPE_OPTIONS = ['BUYER', 'SELLER', 'INVESTOR']

const ORIGIN_LABELS: Record<string, string> = {
  WEBSITE:     'Website',
  REFERRAL:    'Referral',
  ZILLOW:      'Zillow',
  REALTOR_COM: 'Realtor.com',
  INSTAGRAM:   'Instagram',
  MLS:         'MLS',
  OTHER:       'Other',
}

const ORIGIN_COLORS: Record<string, string> = {
  WEBSITE:     'bg-blue-50 text-blue-600',
  REFERRAL:    'bg-green-50 text-green-600',
  INSTAGRAM:   'bg-pink-50 text-pink-600',
  ZILLOW:      'bg-purple-50 text-purple-600',
  REALTOR_COM: 'bg-orange-50 text-orange-600',
  MLS:         'bg-indigo-50 text-indigo-600',
  OTHER:       'bg-gray-100 text-gray-500',
}

const ACTIVITY_LABELS: Record<string, string> = {
  CALL:    'Call',
  EMAIL:   'Email',
  SHOWING: 'Showing',
  OFFER:   'Offer',
  NOTE:    'Note',
}

const ACTIVITY_COLORS: Record<string, string> = {
  CALL:    'bg-green-50 text-green-600 border-green-200',
  EMAIL:   'bg-blue-50 text-blue-600 border-blue-200',
  SHOWING: 'bg-orange-50 text-orange-600 border-orange-200',
  OFFER:   'bg-purple-50 text-purple-600 border-purple-200',
  NOTE:    'bg-gray-50 text-gray-500 border-gray-200',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Activity {
  id: string
  type: string
  notes: string | null
  activityDate: string
  createdAt: string
  user: { id: string; name: string } | null
}

interface Props {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
  onStageChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>
  onDelete?: (leadId: string) => void
}

const INPUT = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 font-barlow text-sm text-navy focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeadDetailModal({ lead, onClose, onUpdate, onStageChange, onDelete }: Props) {
  const [tab, setTab] = useState<'details' | 'log'>('details')

  // ── Details form ──
  const [form, setForm] = useState({
    name:             lead.name,
    email:            lead.email ?? '',
    phone:            lead.phone ?? '',
    type:             lead.type,
    origin:           lead.origin,
    status:           lead.status,
    propertyInterest: lead.propertyInterest ?? '',
    countyPreferred:  lead.countyPreferred ?? '',
    budgetUsd:        lead.budgetUsd?.toString() ?? '',
    acreageDesired:   lead.acreageDesired?.toString() ?? '',
    notes:            lead.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [detailError, setDetailError] = useState('')

  // ── Activity log ──
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingLog, setLoadingLog] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState({ type: 'NOTE', notes: '', activityDate: '' })
  const [addingActivity, setAddingActivity] = useState(false)

  const loadActivities = useCallback(async () => {
    setLoadingLog(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/activities`)
      if (res.ok) setActivities(await res.json())
    } finally {
      setLoadingLog(false)
    }
  }, [lead.id])

  useEffect(() => {
    if (tab === 'log') loadActivities()
  }, [tab, loadActivities])

  // ── Details helpers ───────────────────────────────────────────────────────

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setDetailError('')
    try {
      const body: Record<string, unknown> = {
        name:             form.name,
        email:            form.email || null,
        phone:            form.phone || null,
        type:             form.type,
        origin:           form.origin,
        propertyInterest: form.propertyInterest || null,
        countyPreferred:  form.countyPreferred || null,
        notes:            form.notes || null,
      }
      if (form.budgetUsd)      body.budgetUsd      = parseFloat(form.budgetUsd)
      if (form.acreageDesired) body.acreageDesired = parseFloat(form.acreageDesired)

      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated: Lead = await res.json()

      if (form.status !== lead.status) {
        await onStageChange?.(lead.id, form.status as LeadStatus)
        updated.status = form.status as LeadStatus
      }

      onUpdate(updated)
      setSaved(true)
    } catch {
      setDetailError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  // ── Activity helpers ──────────────────────────────────────────────────────

  async function addActivity() {
    setAddingActivity(true)
    try {
      const body = {
        type: newActivity.type,
        notes: newActivity.notes || null,
        activityDate: newActivity.activityDate || new Date().toISOString(),
      }
      const res = await fetch(`/api/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setNewActivity({ type: 'NOTE', notes: '', activityDate: '' })
        setShowAddForm(false)
        await loadActivities()
      }
    } finally {
      setAddingActivity(false)
    }
  }

  function downloadLog() {
    const lines: string[] = [
      '====================================',
      'LEAD ACTIVITY LOG — 4Rivers Realty',
      '====================================',
      `Lead:    ${lead.name}`,
      `Email:   ${lead.email ?? '—'}`,
      `Phone:   ${lead.phone ?? '—'}`,
      `Status:  ${STATUS_OPTIONS.find((s) => s.value === lead.status)?.label ?? lead.status}`,
      `Origin:  ${ORIGIN_LABELS[lead.origin] ?? lead.origin}`,
      `Type:    ${lead.type}`,
      `Created: ${new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`,
      '',
      `------------------------------------`,
      `ACTIVITIES (${activities.length} entries)`,
      `------------------------------------`,
      '',
    ]

    if (activities.length === 0) {
      lines.push('No activities recorded.')
    } else {
      for (const act of [...activities].reverse()) {
        const date = new Date(act.activityDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        lines.push(`[${date}] ${ACTIVITY_LABELS[act.type] ?? act.type}`)
        if (act.user) lines.push(`  By: ${act.user.name}`)
        if (act.notes) lines.push(`  Note: ${act.notes}`)
        lines.push('')
      }
    }

    lines.push('====================================')

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `lead-log-${lead.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDelete() {
    if (window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) {
      onDelete?.(lead.id)
    }
  }

  const statusColor = STATUS_OPTIONS.find((s) => s.value === form.status)?.color ?? ''
  const originColor = ORIGIN_COLORS[lead.origin] ?? 'bg-gray-100 text-gray-500'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-cormorant font-bold text-2xl text-navy">{form.name}</h2>
              <span className={`font-barlow text-xs font-semibold px-2 py-0.5 rounded-full ${originColor}`}>
                {ORIGIN_LABELS[lead.origin] ?? lead.origin}
              </span>
            </div>
            <span className={`inline-block font-barlow text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${statusColor}`}>
              {STATUS_OPTIONS.find((s) => s.value === form.status)?.label}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {([['details', ClipboardList, 'Details'], ['log', Clock, 'Activity Log']] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-1 py-3 mr-6 font-barlow text-sm font-semibold border-b-2 transition-colors
                ${tab === id ? 'border-brand-blue text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Status selector */}
              <div>
                <label className="font-barlow text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Pipeline Stage
                </label>
                <div className="relative">
                  <select value={form.status} onChange={(e) => set('status', e.target.value)}
                    className={INPUT + ' appearance-none'}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Contact info */}
              <div>
                <label className="font-barlow text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                  Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-barlow text-xs text-gray-500 block mb-1">Full Name</label>
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1">Type</label>
                    <select value={form.type} onChange={(e) => set('type', e.target.value)} className={INPUT + ' bg-white'}>
                      {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1">Origin / Source</label>
                    <select value={form.origin} onChange={(e) => set('origin', e.target.value)} className={INPUT + ' bg-white'}>
                      {Object.entries(ORIGIN_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Property preferences */}
              <div>
                <label className="font-barlow text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                  Property Preferences
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-barlow text-xs text-gray-500 block mb-1">Property Interest</label>
                    <input value={form.propertyInterest} onChange={(e) => set('propertyInterest', e.target.value)}
                      placeholder="e.g. Horse farm 30+ acres with arena" className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> County</label>
                    <input value={form.countyPreferred} onChange={(e) => set('countyPreferred', e.target.value)}
                      placeholder="e.g. Marion County" className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Budget (USD)</label>
                    <input type="number" value={form.budgetUsd} onChange={(e) => set('budgetUsd', e.target.value)}
                      placeholder="e.g. 2000000" className={INPUT} />
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1 flex items-center gap-1"><Ruler className="w-3 h-3" /> Acreage Desired</label>
                    <input type="number" value={form.acreageDesired} onChange={(e) => set('acreageDesired', e.target.value)}
                      placeholder="e.g. 50" className={INPUT} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-barlow text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Internal Notes
                </label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={4}
                  placeholder="Add notes about this lead..."
                  className={INPUT + ' resize-none'} />
              </div>

              {/* Meta */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs font-barlow text-gray-400 flex flex-wrap gap-4">
                <span>Created: {new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                {lead.lastContactAt && (
                  <span>Last contact: {new Date(lead.lastContactAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                )}
                <span>ID: {lead.id.slice(0, 12)}…</span>
              </div>

              {detailError && <p className="text-red-500 font-barlow text-sm">{detailError}</p>}
            </div>
          )}

          {/* ── ACTIVITY LOG TAB ── */}
          {tab === 'log' && (
            <div className="p-6">
              {/* Add activity */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-barlow text-sm text-gray-400 hover:border-brand-blue/50 hover:text-light-blue transition-colors mb-5"
                >
                  <Plus className="w-4 h-4" />
                  Log a call, email, showing or note…
                </button>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-barlow text-xs text-gray-500 block mb-1">Type</label>
                      <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity((p) => ({ ...p, type: e.target.value }))}
                        className={INPUT + ' bg-white'}
                      >
                        {Object.entries(ACTIVITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-barlow text-xs text-gray-500 block mb-1">Date (optional)</label>
                      <input type="datetime-local"
                        value={newActivity.activityDate}
                        onChange={(e) => setNewActivity((p) => ({ ...p, activityDate: e.target.value })) }
                        className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className="font-barlow text-xs text-gray-500 block mb-1">Notes</label>
                    <textarea rows={3}
                      value={newActivity.notes}
                      onChange={(e) => setNewActivity((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Describe what happened…"
                      className={INPUT + ' resize-none'} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 font-barlow text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">
                      Cancel
                    </button>
                    <button
                      onClick={addActivity}
                      disabled={addingActivity}
                      className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white font-barlow text-sm font-semibold rounded-lg hover:bg-light-blue transition disabled:opacity-60"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {addingActivity ? 'Saving…' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {loadingLog ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="font-barlow text-sm text-gray-400">No activity logged yet.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-4 bottom-0 w-px bg-gray-100" />

                  <div className="space-y-3">
                    {activities.map((act) => {
                      const colorClass = ACTIVITY_COLORS[act.type] ?? ACTIVITY_COLORS.NOTE
                      const date = new Date(act.activityDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                      return (
                        <div key={act.id} className="flex gap-4 relative">
                          {/* Dot */}
                          <div className={`w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold z-10 ${colorClass}`}>
                            {(ACTIVITY_LABELS[act.type] ?? 'N')[0]}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`font-barlow text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                                {ACTIVITY_LABELS[act.type] ?? act.type}
                              </span>
                              <span className="font-barlow text-xs text-gray-400">{date}</span>
                              {act.user && (
                                <span className="font-barlow text-xs text-gray-400">· {act.user.name}</span>
                              )}
                            </div>
                            {act.notes && (
                              <p className="font-barlow text-sm text-gray-600 leading-relaxed">{act.notes}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          {tab === 'log' ? (
            <>
              <span className="font-barlow text-xs text-gray-400">{activities.length} entries</span>
              <button
                onClick={downloadLog}
                disabled={activities.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white font-barlow font-semibold text-sm rounded-lg hover:bg-light-blue transition disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Download Log (.txt)
              </button>
            </>
          ) : (
            <>
              {onDelete ? (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 font-barlow text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete lead ${lead.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Lead
                </button>
              ) : <span />}
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-5 py-2.5 font-barlow text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white font-barlow font-semibold text-sm rounded-lg hover:bg-light-blue transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
