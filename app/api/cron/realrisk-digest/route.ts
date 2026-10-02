// GET /api/cron/realrisk-digest
//
// Daily RealRisk email: (1) time-boxed unfiltered delta on the RealRisk
// cursor ('mfrmls:realrisk') so Withdrawn/Expired/Closed transitions land in
// mls_listings, then (2) summary + .xlsx via Resend (lib/realrisk-digest.ts).
//
// NOT scheduled yet — see lib/realrisk-digest.ts for the 3 steps to enable.
// Until REALRISK_DIGEST_TO and RESEND_API_KEY are set, step (2) is a no-op.
//
// Freshness caveat: on the Hobby plan (60s, once a day) the delta can only
// walk a few dozen pages per run, which may be less than Stellar's daily
// modification volume. The email shows the cursor date and flags it when
// it's more than 48h behind — if that happens, run the local catch-up:
//   npx tsx scripts/realrisk-mls-backfill.ts --delta
//
// Protected by CRON_SECRET, same pattern as /api/cron/mls-sync.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { runRealriskSync } from '@/lib/realrisk-mls'
import { sendRealriskDigest } from '@/lib/realrisk-digest'

// Leave ~20s of the 60s budget for building the workbook and sending.
const DELTA_BUDGET_MS = 35_000
const MAX_DELTA_PAGES = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let delta: Awaited<ReturnType<typeof runRealriskSync>> | { error: string }
  try {
    delta = await runRealriskSync({ maxPages: MAX_DELTA_PAGES, deadline: Date.now() + DELTA_BUDGET_MS })
  } catch (err) {
    // A failed delta shouldn't block the email — it reports its own data date.
    console.error('[GET /api/cron/realrisk-digest] delta failed', err)
    delta = { error: err instanceof Error ? err.message : String(err) }
  }

  try {
    const email = await sendRealriskDigest({ days: 1 })
    return NextResponse.json({ ok: true, delta, email })
  } catch (err) {
    console.error('[GET /api/cron/realrisk-digest] email failed', err)
    return NextResponse.json(
      { ok: false, delta, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
