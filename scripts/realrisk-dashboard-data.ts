// scripts/realrisk-dashboard-data.ts — writes data-mls.js for testing the
// RealRisk dashboard standalone (realrisk-mvp repo) with local MLS data.
// Inside 4Rivers the dashboard reads GET /api/realrisk/listings instead.
//
//   npx tsx scripts/realrisk-dashboard-data.ts ../../realrisk-mvp/data-mls.js [--limit 300]
//
// The output holds MLS data — it is gitignored in realrisk-mvp and must
// never be deployed to the public site.

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
  const limitArg = args.indexOf('--limit')
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : 300
  const out = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--limit') ?? 'data-mls.js'

  const { buildDashboardProperties } = await import('@/lib/realrisk-dashboard')
  const { default: prisma } = await import('@/lib/prisma')
  try {
    const properties = await buildDashboardProperties(limit)
    const header =
      `// GERADO por 4Rivers scripts/realrisk-dashboard-data.ts em ${new Date().toISOString()}\n` +
      `// Dados do Stellar MLS — NÃO commitar, NÃO publicar (está no .gitignore).\n`
    fs.writeFileSync(out, `${header}window.MLS_PROPERTIES = ${JSON.stringify(properties, null, 1)};\n`)
    console.log(`[realrisk-dashboard-data] ${properties.length} imóveis → ${path.resolve(out)}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[realrisk-dashboard-data] failed', err)
  process.exit(1)
})
