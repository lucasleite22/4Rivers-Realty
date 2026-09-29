// GET /api/cron/mls-sync
//
// Invoked by Vercel Cron (see vercel.json) every 4 hours. Pulls the MLSGrid
// delta since the last successful run, keeps only Marion/Sumter listings
// (the API itself can't filter by county — see services/mlsgrid.service.ts),
// and upserts them into Property with source: 'MLS'.
//
// New listings land with showOnPortal: false / featured: false — an admin
// has to review and flip showOnPortal in the properties panel before they
// go live (see PATCH /api/properties/bulk for the batch-approve action).
// Shared upsert/compliance rules (MlgCanView/MlgCanUse checks, off-market
// auto-unpublish) live in lib/mls-sync.ts — also used by the weekly
// app/api/cron/mls-reconcile safety-net job.
//
// Not authenticated the normal admin way — protected by CRON_SECRET, the
// standard Vercel Cron pattern (Vercel sends `Authorization: Bearer
// $CRON_SECRET` automatically when the env var is set).

export const dynamic = 'force-dynamic'
// Needs the Vercel Pro plan to actually get 300s (Hobby caps functions at
// 10s); this route does real work per new listing (photo download+reupload
// to Blob), so the default 10s is not enough even for a handful of listings.
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { upsertListing, type UpsertResult } from '@/lib/mls-sync'
import { fetchProperties, fetchNextPage } from '@/services/mlsgrid.service'

const ORIGINATING_SYSTEM = 'mfrmls'
const TARGET_COUNTIES = ['Marion', 'Sumter']

// Safety cap so one invocation can't run past the function timeout. Any
// remaining pages are picked up on the next cron tick — the cursor only
// advances up to what was actually processed in this run. Kept low because
// each new listing now does real work (photo download+reupload to Blob),
// not just a DB write.
const MAX_PAGES_PER_RUN = 5

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats: Record<UpsertResult, number> & { skippedOutOfArea: number; pagesProcessed: number } = {
    created: 0,
    updated: 0,
    removed: 0,
    unpublishedNotIdx: 0,
    skippedNotAuthorized: 0,
    skippedOffMarket: 0,
    skippedOutOfArea: 0,
    pagesProcessed: 0,
  }
  let latestModificationTimestamp: string | undefined

  try {
    const state = await prisma.mlsSyncState.findUnique({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
    })
    const modifiedSince = state?.lastModificationTimestamp.toISOString() ?? '2020-01-01T00:00:00.00Z'

    // No status filter here on purpose — we need to see every status
    // transition (Active → Pending/Closed/Withdrawn/...) to keep our data
    // accurate and to comply with MLS Grid retention rules. See
    // lib/mls-sync.ts for how each status/authorization state is handled.
    let page = await fetchProperties({
      modifiedSince,
      top: 100,
      expand: ['Media'],
    })

    for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_RUN; pageIndex++) {
      stats.pagesProcessed++

      for (const listing of page.listings) {
        latestModificationTimestamp = listing.ModificationTimestamp

        if (!listing.CountyOrParish || !TARGET_COUNTIES.includes(listing.CountyOrParish)) {
          stats.skippedOutOfArea++
          continue
        }

        const result = await upsertListing(listing)
        stats[result]++
      }

      if (!page.nextLink) break
      page = await fetchNextPage(page.nextLink)
    }

    await prisma.mlsSyncState.upsert({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
      create: {
        originatingSystemName: ORIGINATING_SYSTEM,
        lastModificationTimestamp: latestModificationTimestamp ? new Date(latestModificationTimestamp) : new Date(modifiedSince),
        lastRunStatus: 'success',
      },
      update: {
        ...(latestModificationTimestamp ? { lastModificationTimestamp: new Date(latestModificationTimestamp) } : {}),
        lastRunAt: new Date(),
        lastRunStatus: 'success',
        lastRunError: null,
      },
    })

    if (stats.created > 0) {
      await prisma.dashboardEvent.create({
        data: {
          type: 'PROPERTY_CREATED',
          entityId: ORIGINATING_SYSTEM,
          entityType: 'MlsSync',
          metadata: stats,
        },
      })
    }

    return NextResponse.json({ ok: true, ...stats })
  } catch (err) {
    console.error('[GET /api/cron/mls-sync]', err)
    await prisma.mlsSyncState.upsert({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
      create: {
        originatingSystemName: ORIGINATING_SYSTEM,
        lastModificationTimestamp: new Date('2020-01-01T00:00:00.00Z'),
        lastRunStatus: 'error',
        lastRunError: err instanceof Error ? err.message : String(err),
      },
      update: {
        lastRunAt: new Date(),
        lastRunStatus: 'error',
        lastRunError: err instanceof Error ? err.message : String(err),
      },
    })
    return NextResponse.json({ ok: false, ...stats }, { status: 500 })
  }
}
