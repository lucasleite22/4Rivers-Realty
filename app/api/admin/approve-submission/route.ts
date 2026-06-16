// POST /api/admin/approve-submission
// Converts a SELLER lead into a draft Property listing.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const TYPE_MAP: Record<string, string> = {
  'Horse Farm':  'HORSE_FARM',
  'Ranch':       'RANCH',
  'Residential': 'RESIDENTIAL',
  'Commercial':  'COMMERCIAL',
  'Land':        'LAND',
}

function parseLine(notes: string, key: string): string {
  const match = notes.split('\n').find((l) => l.toLowerCase().startsWith(key.toLowerCase() + ':'))
  return match ? match.slice(key.length + 1).trim() : ''
}

function parseAttachments(notes: string): string[] {
  const idx = notes.indexOf('Attachments:')
  if (idx === -1) return []
  return notes
    .slice(idx + 'Attachments:'.length)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('/uploads/'))
}

export async function POST(req: NextRequest) {
  try {
    const token = await requireAuth(req)
    const { leadId } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    if (lead.type !== 'SELLER') {
      return NextResponse.json({ error: 'Lead is not a seller submission' }, { status: 400 })
    }

    const notes = lead.notes ?? ''
    const rawAddress  = parseLine(notes, 'Address')
    const rawCounty   = parseLine(notes, 'County')
    const rawType     = parseLine(notes, 'Type')
    const rawAcreage  = parseLine(notes, 'Acreage')
    const rawAsking   = parseLine(notes, 'Asking').replace(/[^0-9.]/g, '')
    const attachments = parseAttachments(notes)

    const propertyType = TYPE_MAP[rawType] ?? 'LAND'
    const acreage      = rawAcreage ? parseFloat(rawAcreage) || 1 : 1
    const price        = rawAsking  ? parseFloat(rawAsking)  || 0 : 0
    const county       = rawCounty.replace(/\s*County\s*$/i, '').trim() || 'Unknown'

    const title = lead.propertyInterest
      ? lead.propertyInterest.split('—')[0].trim()
      : `${rawType || 'Property'} — ${rawAddress || lead.name}`

    // Create property WITHOUT source field — we set it via raw SQL below
    // so this route works regardless of whether 'npx prisma generate' was run
    const property = await prisma.property.create({
      data: {
        title,
        type:         propertyType as any,
        status:       'ACTIVE'      as any,
        priceUsd:     new Prisma.Decimal(price),
        acreage:      new Prisma.Decimal(acreage),
        county,
        city:         county,
        address:      rawAddress || 'See notes',
        description:  `Submitted by ${lead.name}.\n\n${notes}`,
        featured:     false,
        showOnPortal: false,
      },
    })

    // Set source = 'CLIENT' via raw SQL — non-fatal if column doesn't exist yet
    // Run: ALTER TABLE properties ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'AGENT';
    try {
      await prisma.$executeRaw`UPDATE properties SET source = 'CLIENT' WHERE id = ${property.id}`
    } catch {
      // column not yet added — property is still created, source tag will show as AGENT until DB is migrated
    }

    // Register lead images as property images
    for (let i = 0; i < attachments.length; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url:        attachments[i],
          isCover:    i === 0,
          sortOrder:  i,
        },
      })
    }

    // Mark lead as in review
    await prisma.lead.update({
      where: { id: leadId },
      data:  { status: 'CONTACTED' },
    })

    // Log the stage change as an activity
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: token.sub ?? null,
        type: 'NOTE',
        notes: `Submission approved by admin — Property listing created (ID: ${property.id})`,
        activityDate: new Date(),
      },
    })

    await prisma.dashboardEvent.create({
      data: {
        type:       'PROPERTY_CREATED',
        entityId:   property.id,
        entityType: 'Property',
        userId:     token.sub ?? null,
        metadata:   { title: property.title, source: 'CLIENT', leadId },
      },
    })

    return NextResponse.json({ propertyId: property.id }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/admin/approve-submission]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
