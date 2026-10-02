// scripts/realrisk-mls-backfill.ts — fills mls_listings for RealRisk
//
// Run LOCALLY (no Vercel 60s limit):
//   npx tsx scripts/realrisk-mls-backfill.ts            # backfill: Active/Pending/AUC since cursor
//   npx tsx scripts/realrisk-mls-backfill.ts --delta    # unfiltered delta (catches Withdrawn/Closed)
//   npx tsx scripts/realrisk-mls-backfill.ts --max-pages 50
//
// Safe to Ctrl+C: the 'mfrmls:realrisk' cursor is saved after every page.
// All requests go through the throttled MLSGrid service (~1.67 req/s) and
// the script pauses itself around the portal's daily cron (06:00 UTC), so
// the two never share the token's 2 req/s budget at the same time.

import fs from 'node:fs'
import path from 'node:path'

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
}

const PAGES_PER_CHUNK = 20

// Crons that also call MLSGrid: portal mls-sync at 06:00 UTC and the
// RealRisk digest delta at 10:00 UTC (once scheduled) — stay out of
// 05:50–06:30 and 09:50–10:30.
function inCronWindow(now = new Date()): boolean {
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  return [6, 10].some((h) => minutes >= h * 60 - 10 && minutes < h * 60 + 30)
}

async function main() {
  loadEnv(path.join(process.cwd(), '.env.local'))
  loadEnv(path.join(process.cwd(), '.env'))

  const args = process.argv.slice(2)
  const delta = args.includes('--delta')
  const maxPagesArg = args.indexOf('--max-pages')
  const maxPages = maxPagesArg >= 0 ? Number(args[maxPagesArg + 1]) : Infinity

  // Imported after the env is loaded — lib/prisma reads DATABASE_URL on import.
  const { runRealriskSync, REALRISK_COUNTIES } = await import('@/lib/realrisk-mls')
  const { DEFAULT_SYNC_STATUSES } = await import('@/lib/mls-sync')
  const { default: prisma } = await import('@/lib/prisma')

  console.log(`[realrisk-backfill] counties=${REALRISK_COUNTIES.join(',')} mode=${delta ? 'delta' : 'backfill'}`)
  const totals = { created: 0, updated: 0, removed: 0, skipped: 0, outOfArea: 0, pages: 0 }
  const startedAt = Date.now()

  try {
    while (totals.pages < maxPages) {
      if (inCronWindow()) {
        console.log('[realrisk-backfill] cron window (05:50–06:30 or 09:50–10:30 UTC) — pausing 5 min')
        await new Promise((r) => setTimeout(r, 5 * 60_000))
        continue
      }

      const stats = await runRealriskSync({
        statuses: delta ? undefined : DEFAULT_SYNC_STATUSES,
        maxPages: Math.min(PAGES_PER_CHUNK, maxPages - totals.pages),
      })
      totals.created += stats.created
      totals.updated += stats.updated
      totals.removed += stats.removed
      totals.skipped += stats.skipped
      totals.outOfArea += stats.outOfArea
      totals.pages += stats.pagesProcessed

      const mins = ((Date.now() - startedAt) / 60_000).toFixed(1)
      console.log(
        `[realrisk-backfill] ${mins}min pages=${totals.pages} created=${totals.created} ` +
          `updated=${totals.updated} removed=${totals.removed} skipped=${totals.skipped} ` +
          `outOfArea=${totals.outOfArea} cursor=${stats.cursor}`
      )
      if (stats.done) {
        console.log('[realrisk-backfill] caught up with the feed — done')
        break
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[realrisk-backfill] failed', err)
  process.exit(1)
})
