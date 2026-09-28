// PATCH /api/properties/bulk — auth required
// Applies a small set of updates to many properties at once. Built for the
// MLS curation queue (admin/properties panel filtered by source=MLS,
// showOnPortal=false) where approving one listing at a time doesn't scale.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth(req)

    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids : []
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids required' }, { status: 400 })
    }

    const data: { showOnPortal?: boolean; featured?: boolean } = {}
    if (typeof body.showOnPortal === 'boolean') data.showOnPortal = body.showOnPortal
    if (typeof body.featured === 'boolean') data.featured = body.featured

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'no updatable fields provided' }, { status: 400 })
    }

    const result = await prisma.property.updateMany({
      where: { id: { in: ids } },
      data,
    })

    return NextResponse.json({ updated: result.count })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[PATCH /api/properties/bulk]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
