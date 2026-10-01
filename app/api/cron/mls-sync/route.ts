// GET /api/cron/mls-sync
//
// Invoked by Vercel Cron (see vercel.json) once a day. Pulls the MLSGrid
// delta since the last successful run, keeps only Marion/Sumter listings
// (the API itself can't filter by county — see services/mlsgrid.service.ts),
// and upserts them into Property with source: 'MLS'.
//
// Daily cadence + the duration/page caps below are sized for the Vercel
// Hobby plan (cron jobs capped at once/day; function duration capped at
// 60s). Still comfortably inside the ~72h staleness window MLS rules
// require. If this moves to Pro, both the schedule and these caps can be
// relaxed for fresher data.
//
// New listings land with showOnPortal: false / featured: false — an admin
// has to review and flip showOnPortal in the properties panel before they
// go live (see PATCH /api/properties/bulk for the batch-approve action).
// The actual sync loop (and the default status filter / cursor-advance
// rules) lives in lib/mls-sync.ts's runMlsSync — also used by
// app/api/admin/mls-sync for manual/filtered runs triggered from the admin
// panel, and complemented by the weekly app/api/cron/mls-reconcile
// safety-net job.
//
// Not authenticated the normal admin way — protected by CRON_SECRET, the
// standard Vercel Cron pattern (Vercel sends `Authorization: Bearer
// $CRON_SECRET` automatically when the env var is set).

export const dynamic = 'force-dynamic'
// 60s is the max maxDuration the Hobby plan allows. This route does real
// work per new listing (photo download+reupload to Blob), so pages/images
// are capped below to fit that budget.
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { runMlsSync, DEFAULT_SYNC_STATUSES } from '@/lib/mls-sync'

// Safety cap so one invocation can't run past the 60s function timeout. Any
// remaining pages are picked up on the next cron tick — the cursor only
// advances up to what was actually processed in this run. Kept low because
// each new listing does real work (photo download+reupload to Blob), not
// just a DB write.
//
// Lowered from 3 to 2 after the manual 2-minute backfill loop started
// hitting 504 Gateway Timeout fairly often — runs with ~15+ new listings in
// a single invocation (3 pages x up to 100 listings) were pushing past 60s
// once the throttled photo re-hosting calls piled up.
const MAX_PAGES_PER_RUN = 2

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await runMlsSync({
      statuses: DEFAULT_SYNC_STATUSES,
      maxPages: MAX_PAGES_PER_RUN,
      updateCursor: true,
    })
    return NextResponse.json({ ok: true, ...stats })
  } catch (err) {
    console.error('[GET /api/cron/mls-sync]', err)
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
