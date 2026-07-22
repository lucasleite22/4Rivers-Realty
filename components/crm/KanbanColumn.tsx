'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Lead } from '@prisma/client'
import KanbanCard from './KanbanCard'

interface Props {
  id: string
  title: string
  leads: Lead[]
  color: string
  onCardClick?: (lead: Lead) => void
  onDeleteLead?: (leadId: string) => void
}

export default function KanbanColumn({ id, title, leads, color, onCardClick, onDeleteLead }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[200px] rounded-xl transition-colors
        ${isOver ? 'bg-brand-blue/5 ring-2 ring-brand-blue/30' : 'bg-navy/5'}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy/10">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="font-barlow font-semibold text-sm text-navy">{title}</h3>
        </div>
        <span className="font-barlow text-xs font-bold text-navy/40 bg-white rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 p-3 flex-1">
          {leads.length === 0 && (
            <p className="font-barlow text-xs text-navy/30 text-center py-6">
              Drop leads here
            </p>
          )}
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onClick={onCardClick} onDelete={onDeleteLead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
