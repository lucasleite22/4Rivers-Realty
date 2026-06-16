export const dynamic = 'force-dynamic'

// app/api/leads/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// ── GET /api/leads — auth required ───────────

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const { searchParams } = req.nextUrl
    const where: Prisma.LeadWhereInput = {}

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const origin = searchParams.get('origin')
    const assignedToId = searchParams.get('assignedToId')
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 25)))

    if (status) where.status = status as any
    if (type) where.type = type as any
    if (origin) where.origin = origin as any
    if (assignedToId) where.assignedToId = assignedToId

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { propertyInterest: { contains: search } },
        { countyPreferred: { contains: search } },
      ]
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          activities: { orderBy: { activityDate: 'desc' }, take: 3 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      data: leads,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[GET /api/leads]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/leads ───────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        type: body.type ?? 'BUYER',
        origin: body.origin ?? 'WEBSITE',
        propertyInterest: body.propertyInterest ?? null,
        budgetUsd: body.budgetUsd ? new Prisma.Decimal(body.budgetUsd) : null,
        acreageDesired: body.acreageDesired ? new Prisma.Decimal(body.acreageDesired) : null,
        countyPreferred: body.countyPreferred ?? null,
        status: 'NEW_LEAD',
        notes: body.notes ?? null,
        assignedToId: body.assignedToId ?? null,
      },
    })

    await prisma.dashboardEvent.create({
      data: {
        type: 'LEAD_CREATED',
        entityId: lead.id,
        entityType: 'Lead',
        metadata: { name: lead.name, origin: lead.origin },
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (err) {
    console.error('[POST /api/leads]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
