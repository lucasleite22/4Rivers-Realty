'use client'

import { useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Lead } from '@prisma/client'
import { GripVertical, Phone, Mail, Calendar } from 'lucide-react'

interface Props {
  lead: Lead
  onClick?: (lead: Lead) => void
}

const ORIGIN_LABELS: Record<string, string> = {
  WEBSITE:     'Website',
  REFERRAL:    'Referral',
  INSTAGRAM:   'Instagram',
  ZILLOW:      'Zillow',
  REALTOR_COM: 'Realtor.com',
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

export default function KanbanCard({ lead, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  // Track whether a real drag occurred so onClick is not fired after drop
  const didDragRef = useRef(false)
  useEffect(() => {
    if (isDragging) didDragRef.current = true
  }, [isDragging])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const created = new Date(lead.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  function handleClick() {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    onClick?.(lead)
  }

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-xl p-4 shadow-sm border border-gray-100
        hover:border-brand-blue/40 hover:shadow-md transition-all select-none
        ${isDragging ? 'ring-2 ring-brand-blue shadow-xl z-50 cursor-grabbing' : 'cursor-grab'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(lead)}
      aria-label={`Lead: ${lead.name}. Press Enter for details.`}
    >
      {/* Drag handle — the only area with listeners */}
      <div
        {...listeners}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing p-0.5 -m-0.5 rounded"
        onClick={stop}
        aria-label="Drag handle"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="pr-6">
        <p className="font-barlow font-semibold text-navy text-sm leading-snug">
          {lead.name}
        </p>
        {lead.propertyInterest && (
          <p className="font-barlow text-xs text-gray-400 mt-0.5 truncate">
            {lead.propertyInterest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onPointerDown={stop}
            onClick={stop}
            className="flex items-center gap-1 font-barlow text-xs text-gray-500 hover:text-brand-blue transition-colors"
            aria-label={`Call ${lead.name}`}
          >
            <Phone className="w-3 h-3" />
            {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onPointerDown={stop}
            onClick={stop}
            className="flex items-center gap-1 font-barlow text-xs text-gray-500 hover:text-brand-blue transition-colors"
            aria-label={`Email ${lead.name}`}
          >
            <Mail className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{lead.email}</span>
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className={`font-barlow text-xs px-2 py-0.5 rounded-full font-semibold ${ORIGIN_COLORS[lead.origin] ?? 'bg-gray-100 text-gray-500'}`}>
          {ORIGIN_LABELS[lead.origin] ?? lead.origin}
        </span>
        <span className="flex items-center gap-1 font-barlow text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {created}
        </span>
      </div>
    </div>
  )
}
