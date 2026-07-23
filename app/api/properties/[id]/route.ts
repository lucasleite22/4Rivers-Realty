// app/api/properties/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// ── GET /api/properties/[id] ─────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  return NextResponse.json(property)
}

// ── PATCH /api/properties/[id] ───────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await requireAuth(req)
    const body = await req.json()

    const data: Prisma.PropertyUpdateInput = {}
    if (body.title !== undefined) data.title = body.title
    if (body.type !== undefined) data.type = body.type
    if (body.priceUsd !== undefined) data.priceUsd = new Prisma.Decimal(body.priceUsd)
    if (body.acreage !== undefined) data.acreage = new Prisma.Decimal(body.acreage)
    if (body.county !== undefined) data.county = body.county
    if (body.city !== undefined) data.city = body.city
    if (body.address !== undefined) data.address = body.address
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) {
      data.status = body.status
      if (body.status === 'SOLD') {
        await prisma.dashboardEvent.create({
          data: {
            type: 'PROPERTY_SOLD',
            entityId: params.id,
            entityType: 'Property',
            userId: token.sub,
            metadata: { status: 'SOLD' },
          },
        })
      }
    }
    if (body.featured !== undefined) data.featured = body.featured
    if (body.showOnPortal !== undefined) data.showOnPortal = body.showOnPortal
    if (body.stables !== undefined) data.stables = body.stables
    if (body.arenas !== undefined) data.arenas = body.arenas
    if (body.pastures !== undefined) data.pastures = body.pastures
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl
    if (body.isLaunch !== undefined) data.isLaunch = body.isLaunch
    if (body.launchBadge !== undefined) data.launchBadge = body.launchBadge
    if (body.launchDate !== undefined) data.launchDate = body.launchDate ? new Date(body.launchDate) : null

    const property = await prisma.property.update({
      where: { id: params.id },
      data,
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })

    return NextResponse.json(property)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[PATCH /api/properties/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/properties/[id] ──────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)
    await prisma.property.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[DELETE /api/properties/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
