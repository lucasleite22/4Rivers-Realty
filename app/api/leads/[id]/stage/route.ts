// app/api/leads/[id]/stage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await requireAuth(req)
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: 'status required' }, { status: 400 })
    }

    const previous = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { status: true },
    })

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    })

    await prisma.dashboardEvent.create({
      data: {
        type: 'LEAD_STAGE_CHANGED',
        entityId: params.id,
        entityType: 'Lead',
        userId: token.sub,
        metadata: { from: previous?.status, to: status },
      },
    })

    // Fire DEAL_CLOSED event when won
    if (status === 'CLOSED_WON') {
      await prisma.dashboardEvent.create({
        data: {
          type: 'DEAL_CLOSED',
          entityId: params.id,
          entityType: 'Lead',
          userId: token.sub,
          metadata: { leadName: lead.name },
        },
      })
    }

    return NextResponse.json(lead)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[PATCH /api/leads/[id]/stage]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
