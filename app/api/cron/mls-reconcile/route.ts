// GET /api/cron/mls-reconcile
//
// Weekly safety net for the incremental delta sync (app/api/cron/mls-sync).
// The delta sync only sees a listing again if it shows up in a
// ModificationTimestamp window it actually ran for — if the cron fails or
// is paused for a few days, whatever changed on those listings in the
// meantime is silently missed (a sale, a withdrawal, an MlgCanView/MlgCanUse
// flip). This job re-checks every MLS-sourced property we currently store,
// directly against the live API, and applies the same compliance rules
// (lib/mls-sync.ts) regardless of whether anything was ever re-delivered
// through the delta feed.
//
// Processes the batch of properties least-recently checked first (ordered
// by updatedAt), capped per run — over a few weekly runs this sweeps the
// whole table without needing its own cursor: upsertListing bumps
// updatedAt on every record it touches, which naturally rotates the queue.
//
// Same CRON_SECRET auth as mls-sync (see vercel.json for the schedule).

export const dynamic = 'force-dynamic'
// 60s is the max maxDuration the Vercel Hobby plan allows.
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { upsertListing, type UpsertResult } from '@/lib/mls-sync'
import { fetchPropertyByKey } from '@/services/mlsgrid.service'

// No photo re-hosting happens on reconcile (only on first import), so each
// check is one lightweight API call — but MLSGrid throttles this
// subscription to 2 req/s (see services/mlsgrid.service.ts's throttle()),
// so each request costs at least 600ms plus actual round-trip time. Sized
// to fit comfortably inside the 60s Hobby plan function timeout even with
// that floor (50 * 600ms = 30s of enforced waiting alone).
const BATCH_SIZE = 50

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats: Record<UpsertResult, number> & { removedNotFound: number; errored: number; checked: number } = {
    created: 0,
    updated: 0,
    removed: 0,
    unpublishedNotIdx: 0,
    skippedNotAuthorized: 0,
    skippedOffMarket: 0,
    removedNotFound: 0,
    errored: 0,
    checked: 0,
  }

  try {
    const batch = await prisma.property.findMany({
      where: { source: 'MLS', mlsId: { not: null } },
      orderBy: { updatedAt: 'asc' },
      take: BATCH_SIZE,
      select: { id: true, mlsId: true },
    })

    for (const row of batch) {
      if (!row.mlsId) continue
      stats.checked++

      try {
        const listing = await fetchPropertyByKey(row.mlsId, [])

        if (!listing) {
          // Gone entirely from the API, not just status-changed — same
          // treatment as MlgCanView: false.
          await prisma.property.delete({ where: { id: row.id } })
          stats.removedNotFound++
          continue
        }

        const result = await upsertListing(listing)
        stats[result]++
      } catch (err) {
        // One bad record shouldn't stop the sweep.
        console.error(`[mls-reconcile] failed to check ${row.mlsId}`, err)
        stats.errored++
      }
    }

    return NextResponse.json({ ok: true, ...stats })
  } catch (err) {
    console.error('[GET /api/cron/mls-reconcile]', err)
    return NextResponse.json({ ok: false, ...stats, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
