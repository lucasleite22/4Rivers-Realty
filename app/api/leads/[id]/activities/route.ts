// app/api/leads/[id]/activities/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)
    const activities = await prisma.leadActivity.findMany({
      where: { leadId: params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { activityDate: 'desc' },
    })
    return NextResponse.json(activities)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await requireAuth(req)
    const body = await req.json()

    const activityDate = body.activityDate ? new Date(body.activityDate) : new Date()

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        userId: token.sub,
        type: body.type,
        notes: body.notes ?? null,
        activityDate,
      },
      include: { user: { select: { id: true, name: true } } },
    })

    // Update lastContactAt
    await prisma.lead.update({
      where: { id: params.id },
      data: { lastContactAt: activityDate },
    })

    // Dashboard event for showings and offers
    if (body.type === 'SHOWING') {
      await prisma.dashboardEvent.create({
        data: {
          type: 'SHOWING_SCHEDULED',
          entityId: params.id,
          entityType: 'Lead',
          userId: token.sub,
          metadata: { activityId: activity.id },
        },
      })
    } else if (body.type === 'OFFER') {
      await prisma.dashboardEvent.create({
        data: {
          type: 'OFFER_MADE',
          entityId: params.id,
          entityType: 'Lead',
          userId: token.sub,
          metadata: { activityId: activity.id },
        },
      })
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/leads/[id]/activities]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
