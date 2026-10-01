// PATCH /api/properties/bulk — auth required
// Applies a small set of updates to many properties at once. Built for the
// MLS curation queue (admin/properties panel filtered by source=MLS,
// showOnPortal=false) where approving one listing at a time doesn't scale.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { backfillMlsPhotos } from '@/lib/mls-sync'

// Bulk-approving MLS listings can trigger backfillMlsPhotos per listing
// below (re-fetch from MLSGrid + re-host photos) — 60s is the Hobby plan's
// max function duration, needed well past the ~10s default.
export const maxDuration = 60

// Soft budget for the photo-backfill loop below, leaving headroom under
// maxDuration for the updateMany + response. A bulk approval of many MLS
// listings at once may not finish backfilling all of them in one request —
// backfillMlsPhotos is idempotent, so whatever's left just gets picked up
// the next time any of those listings is touched (edited, re-approved).
const BACKFILL_BUDGET_MS = 45_000

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

    const isApproving = data.showOnPortal === true
    const toBackfill = isApproving
      ? await prisma.property.findMany({
          where: { id: { in: ids }, showOnPortal: false, source: 'MLS' },
          select: { id: true },
        })
      : []

    const result = await prisma.property.updateMany({
      where: { id: { in: ids } },
      data,
    })

    const start = Date.now()
    for (const { id } of toBackfill) {
      if (Date.now() - start > BACKFILL_BUDGET_MS) break
      await backfillMlsPhotos(id)
    }

    return NextResponse.json({ updated: result.count })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[PATCH /api/properties/bulk]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
