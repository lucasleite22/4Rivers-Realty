import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// POST /api/contact — public endpoint, no auth required
// Creates a new lead from the website contact form

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, email, phone, propertyInterest, notes, origin, type } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email?.trim() ?? null,
        phone: phone?.trim() ?? null,
        type: type ?? 'BUYER',
        origin: origin ?? 'WEBSITE',
        propertyInterest: propertyInterest ?? null,
        status: 'NEW_LEAD',
        notes: notes?.trim() ?? null,
      },
    })

    // Log dashboard event so the CRM feed picks it up
    await prisma.dashboardEvent.create({
      data: {
        type: 'LEAD_CREATED',
        entityId: lead.id,
        entityType: 'Lead',
        metadata: {
          name: lead.name,
          origin: lead.origin,
          source: 'contact_form',
        },
      },
    })

    return NextResponse.json(
      { success: true, id: lead.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
