// scripts/realrisk-export.ts — writes the RealRisk management spreadsheet
// from the local mls_listings table (same output as GET /api/realrisk/export).
//
//   npx tsx scripts/realrisk-export.ts [saida.xlsx] [--days 7]

import fs from 'node:fs'
import path from 'node:path'

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
}

async function main() {
  loadEnv(path.join(process.cwd(), '.env.local'))
  loadEnv(path.join(process.cwd(), '.env'))

  const args = process.argv.slice(2)
  const daysArg = args.indexOf('--days')
  const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 7
  const out = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--days') ??
    `realrisk-mls-${new Date().toISOString().slice(0, 10)}.xlsx`

  const { buildRealriskWorkbook, loadRealriskListings } = await import('@/lib/realrisk-excel')
  const { default: prisma } = await import('@/lib/prisma')
  try {
    const listings = await loadRealriskListings()
    const buffer = await buildRealriskWorkbook(listings, { days })
    fs.writeFileSync(out, Buffer.from(buffer))
    console.log(`[realrisk-export] ${listings.length} listings → ${path.resolve(out)}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[realrisk-export] failed', err)
  process.exit(1)
})
