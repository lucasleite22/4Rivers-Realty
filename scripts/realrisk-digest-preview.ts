// scripts/realrisk-digest-preview.ts — preview the daily RealRisk email locally
//
//   npx tsx scripts/realrisk-digest-preview.ts [outDir] [--days 1]
//
// Reads mls_listings only (no MLSGrid calls, no email sent) and writes
// digest.html + the .xlsx attachment to outDir (default: ./realrisk-digest-preview).

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
  const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 1
  const outDir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--days') ?? 'realrisk-digest-preview'

  // Imported after the env is loaded — lib/prisma reads DATABASE_URL on import.
  const { buildRealriskDigest, digestRecipients } = await import('@/lib/realrisk-digest')
  const { default: prisma } = await import('@/lib/prisma')

  try {
    const digest = await buildRealriskDigest({ days })
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'digest.html'), digest.html)
    fs.writeFileSync(path.join(outDir, digest.attachment.filename), digest.attachment.content)
    console.log(`Assunto: ${digest.subject}`)
    console.log(`Contagens: ${JSON.stringify(digest.counts)}`)
    console.log(`Destinatários configurados: ${digestRecipients().join(', ') || '(nenhum — REALRISK_DIGEST_TO vazio)'}`)
    console.log(`Arquivos em ${path.resolve(outDir)}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
