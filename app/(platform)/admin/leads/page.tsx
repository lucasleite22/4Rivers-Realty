'use client'

import { useState, useEffect } from 'react'
import type { Lead, LeadStatus } from '@prisma/client'
import KanbanBoard from '@/components/crm/KanbanBoard'
import { Download } from 'lucide-react'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((data) => setLeads(data.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleStageChange(leadId: string, newStatus: LeadStatus) {
    await fetch(`/api/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  async function handleDeleteLead(leadId: string) {
    const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete lead')
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
  }

  function downloadExport() {
    window.open('/api/export/leads', '_blank')
  }

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cormorant text-3xl">Lead Pipeline</h1>
          <p className="font-barlow text-white/50 text-sm mt-0.5">
            Drag cards between columns to update status
          </p>
        </div>
        <button
          onClick={downloadExport}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-dark-navy font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="font-barlow text-white/40">Loading leads…</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <KanbanBoard
            initialLeads={leads}
            onStageChange={handleStageChange}
            onDeleteLead={handleDeleteLead}
          />
        </div>
      )}
    </div>
  )
}
