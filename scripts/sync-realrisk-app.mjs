// scripts/sync-realrisk-app.mjs — copies the RealRisk dashboard (static
// HTML/JS from the realrisk-mvp repo) into public/realrisk.
//
//   node scripts/sync-realrisk-app.mjs [caminho/do/realrisk-mvp]
//
// Only app code is copied — never data-mls.js (MLS data). Inside 4Rivers the
// app fetches /api/realrisk/listings (session-protected) instead.

import fs from 'node:fs'
import path from 'node:path'

const source = path.resolve(process.argv[2] ?? '../../realrisk-mvp')
const target = path.resolve('public/realrisk')
const FILES = ['index.html', 'styles.css', 'data.js', 'scoring.js', 'supabase-config.js', 'social.js', 'app.js']

fs.mkdirSync(target, { recursive: true })
for (const file of FILES) {
  fs.copyFileSync(path.join(source, file), path.join(target, file))
}
console.log(`[sync-realrisk-app] ${FILES.length} arquivos de ${source} → ${target}`)
