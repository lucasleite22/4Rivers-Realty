// POST /api/admin/mls-sync
//
// Manual trigger for the MLS sync, from the admin panel (see
// app/(platform)/admin/mls-sync/page.tsx). Lets an admin run a one-off pass
// with a custom status/property-type filter and page count — e.g. to pull
// just "Commercial" listings, or to push through the Hobby-plan 60s/page
// cap faster than the once-a-day cron while backfilling.
//
// Reuses the exact same runMlsSync loop as the daily cron
// (app/api/cron/mls-sync) — see lib/mls-sync.ts. The one thing that differs
// is cursor handling: the delta cursor (mlsSyncState) is shared by every
// run for this OriginatingSystem, so only a run using the cron's default
// filters is allowed to advance it. A custom-filtered admin run never
// touches it, so it can't make the next default cron run skip listings
// outside whatever filter was used here.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { runMlsSync, DEFAULT_SYNC_STATUSES } from '@/lib/mls-sync'
import type { MlsStatus, MlsPropertyTypeFilter } from '@/services/mlsgrid.service'

const ALLOWED_STATUSES: MlsStatus[] = ['Active', 'Pending', 'Active Under Contract', 'Closed']
const ALLOWED_PROPERTY_TYPES: MlsPropertyTypeFilter[] = ['Residential', 'Land', 'Commercial', 'Farm']
const MAX_PAGES_CAP = 3 // same 60s-function-timeout budget as the cron route

function isDefaultFilter(statuses: MlsStatus[], propertyType?: MlsPropertyTypeFilter) {
  if (propertyType) return false
  if (statuses.length !== DEFAULT_SYNC_STATUSES.length) return false
  const sortedA = [...statuses].sort()
  const sortedB = [...DEFAULT_SYNC_STATUSES].sort()
  return sortedA.every((s, i) => s === sortedB[i])
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)

    const body = await req.json().catch(() => ({}))

    const rawStatuses: unknown = body.statuses
    const statuses: MlsStatus[] =
      Array.isArray(rawStatuses) && rawStatuses.length > 0
        ? rawStatuses.filter((s): s is MlsStatus => ALLOWED_STATUSES.includes(s))
        : DEFAULT_SYNC_STATUSES

    const propertyType: MlsPropertyTypeFilter | undefined =
      typeof body.propertyType === 'string' && ALLOWED_PROPERTY_TYPES.includes(body.propertyType)
        ? body.propertyType
        : undefined

    const maxPages = Math.min(MAX_PAGES_CAP, Math.max(1, Number(body.maxPages) || 1))

    const stats = await runMlsSync({
      statuses,
      propertyType,
      maxPages,
      updateCursor: isDefaultFilter(statuses, propertyType),
    })

    return NextResponse.json({ ok: true, ...stats })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/admin/mls-sync]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
