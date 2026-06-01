// app/api/leads/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { activityDate: 'desc' },
        },
      },
    })

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)
    const body = await req.json()

    const data: Prisma.LeadUpdateInput = {}
    const allowed = ['name', 'email', 'phone', 'type', 'origin', 'propertyInterest',
      'countyPreferred', 'notes', 'assignedToId', 'lastContactAt']
    for (const key of allowed) {
      if (body[key] !== undefined) (data as any)[key] = body[key]
    }
    if (body.budgetUsd !== undefined) data.budgetUsd = new Prisma.Decimal(body.budgetUsd)
    if (body.acreageDesired !== undefined) data.acreageDesired = new Prisma.Decimal(body.acreageDesired)

    const lead = await prisma.lead.update({ where: { id: params.id }, data })
    return NextResponse.json(lead)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)
    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
