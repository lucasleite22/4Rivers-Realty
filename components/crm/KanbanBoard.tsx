'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Lead, LeadStatus } from '@prisma/client'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import LeadDetailModal from './LeadDetailModal'

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'NEW_LEAD',        title: 'Novo Lead',    color: 'bg-blue-400' },
  { id: 'CONTACTED',       title: 'Contactado',   color: 'bg-yellow-400' },
  { id: 'SHOWING',         title: 'Visita',       color: 'bg-orange-400' },
  { id: 'OFFER_MADE',      title: 'Proposta',     color: 'bg-purple-400' },
  { id: 'UNDER_CONTRACT',  title: 'Contrato',     color: 'bg-cyan-400' },
  { id: 'CLOSED_WON',      title: 'Fechado ✓',    color: 'bg-green-400' },
  { id: 'CLOSED_LOST',     title: 'Perdido',      color: 'bg-red-400' },
]

interface Props {
  initialLeads: Lead[]
  onStageChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>
  onCardClick?: (lead: Lead) => void
  onDeleteLead?: (leadId: string) => Promise<void>
}

export default function KanbanBoard({ initialLeads, onStageChange, onCardClick, onDeleteLead }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // pointerWithin first (pointer is inside a droppable), fall back to closestCenter
  const collisionDetection: CollisionDetection = (args) => {
    const within = pointerWithin(args)
    return within.length > 0 ? within : closestCenter(args)
  }

  const getLeadsForColumn = useCallback(
    (status: LeadStatus) => leads.filter((l) => l.status === status),
    [leads]
  )

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  async function handleDeleteLead(leadId: string) {
    const previousLeads = leads
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    setSelectedLead((prev) => (prev?.id === leadId ? null : prev))
    try {
      await onDeleteLead?.(leadId)
    } catch {
      // Rollback on failure
      setLeads(previousLeads)
    }
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const overId = String(over.id)
    const lead = leads.find((l) => l.id === String(active.id))
    if (!lead) return

    // `over` is either a column id (LeadStatus) or another card id
    const targetStatus = COLUMNS.find((c) => c.id === overId)
      ? (overId as LeadStatus)
      : leads.find((l) => l.id === overId)?.status

    if (!targetStatus || targetStatus === lead.status) return

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: targetStatus } : l))
    )

    try {
      await onStageChange?.(lead.id, targetStatus)
    } catch {
      // Rollback on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: lead.status } : l))
      )
    }
  }

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))` }}
        role="region"
        aria-label="Lead pipeline Kanban board"
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            leads={getLeadsForColumn(col.id)}
            onCardClick={(lead) => setSelectedLead(lead)}
            onDeleteLead={handleDeleteLead}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 shadow-2xl opacity-90">
            <KanbanCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {selectedLead && (
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={(updated) => {
          setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l))
          setSelectedLead(null)
        }}
        onStageChange={onStageChange}
        onDelete={handleDeleteLead}
      />
    )}
  </>
  )
}
