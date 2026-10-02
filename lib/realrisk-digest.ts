// lib/realrisk-digest.ts — daily RealRisk email (summary + .xlsx attached)
//
// Architecture only for now: nothing is scheduled. To turn it on:
//   1. Set REALRISK_DIGEST_TO (comma-separated) and RESEND_API_KEY in Vercel.
//   2. Make sure the sender domain is verified in Resend (REALRISK_DIGEST_FROM,
//      default FROM_ADDRESS from lib/resend.ts).
//   3. Add { "path": "/api/cron/realrisk-digest", "schedule": "0 10 * * *" }
//      to vercel.json (10:00 UTC = 07:00 BRT, well clear of the portal's
//      06:00 UTC mls-sync so the two never share the token's 2 req/s budget).
// Without REALRISK_DIGEST_TO / RESEND_API_KEY, sendRealriskDigest() is a no-op
// that reports why — safe to deploy.
//
// Internal use only (Lucas/Jales): the attachment is MLS data — check the
// Stellar MLS Participant Data Access Agreement before adding anyone outside.

import type { MlsListing } from '@prisma/client'
import prisma from '@/lib/prisma'
import { FROM_ADDRESS, getResend } from '@/lib/resend'
import { REALRISK_SYNC_STATE } from '@/lib/realrisk-mls'
import {
  buildRealriskWorkbook,
  loadRealriskListings,
  partitionRealriskListings,
  priceCut,
  SUSPECT_CUT,
} from '@/lib/realrisk-excel'

const TOP_N = 10

export interface RealriskDigest {
  subject: string
  html: string
  text: string
  attachment: { filename: string; content: Buffer }
  counts: Record<'novos' | 'ativos' | 'sobContrato' | 'reducaoPreco' | 'sairamDoMercado', number>
  dataAsOf: Date | null
}

const usd = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const dec = (d: { toNumber(): number } | null) => (d == null ? null : d.toNumber())

function rowsHtml(listings: MlsListing[], withCut: boolean): string {
  if (!listings.length) return '<p style="color:#666">Nenhum.</p>'
  const head = ['MLS #', 'Endereço', 'Cidade', 'Preço', ...(withCut ? ['Redução'] : []), 'Corretora']
  const rows = listings.map((l) => {
    const cut = priceCut(l)
    const cells = [
      esc(l.listingId),
      esc(l.address),
      esc(`${l.city ?? ''} (${l.county ?? ''})`),
      usd(dec(l.listPrice)),
      ...(withCut ? [cut == null ? '—' : `${(cut * 100).toFixed(0)}%${cut >= SUSPECT_CUT ? ' ⚠️' : ''}`] : []),
      // MLS compliance: always show the listing office of record.
      esc(l.listOfficeName),
    ]
    return `<tr>${cells.map((c) => `<td style="padding:4px 8px;border-bottom:1px solid #eee">${c}</td>`).join('')}</tr>`
  })
  return `<table style="border-collapse:collapse;font-size:13px"><thead><tr>${head
    .map((h) => `<th style="text-align:left;padding:4px 8px;background:#174079;color:#fff">${h}</th>`)
    .join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`
}

export async function buildRealriskDigest(options: { days?: number } = {}): Promise<RealriskDigest> {
  const days = options.days ?? 1
  const listings = await loadRealriskListings()
  const tabs = partitionRealriskListings(listings, days)
  const buffer = await buildRealriskWorkbook(listings, { days })

  const state = await prisma.mlsSyncState.findUnique({ where: { originatingSystemName: REALRISK_SYNC_STATE } })
  const dataAsOf = state?.lastModificationTimestamp ?? null

  const counts = {
    novos: tabs.novos.length,
    ativos: tabs.ativos.length,
    sobContrato: tabs.sobContrato.length,
    reducaoPreco: tabs.reducaoPreco.length,
    sairamDoMercado: tabs.sairamDoMercado.length,
  }

  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/New_York' })
  const asOfText = dataAsOf
    ? dataAsOf.toLocaleString('pt-BR', { timeZone: 'America/New_York' }) + ' (horário da Flórida)'
    : 'desconhecido'
  // A stale cursor means the daily delta isn't keeping up — say so loudly
  // instead of mailing old data as if it were today's.
  const stale = !dataAsOf || Date.now() - dataAsOf.getTime() > 48 * 3_600_000
  const window = days === 1 ? 'nas últimas 24h' : `nos últimos ${days} dias`

  const subject = `RealRisk ${today} — ${counts.novos} novos, ${counts.sairamDoMercado} saíram${stale ? ' ⚠️ dados desatualizados' : ''}`

  const html = `<div style="font-family:Calibri,Arial,sans-serif;color:#222">
<h2 style="color:#174079;margin-bottom:4px">RealRisk — resumo diário do MLS</h2>
<p style="color:#666;margin-top:0">Dados do MLS atualizados até ${esc(asOfText)}${
    stale ? ' <strong style="color:#b00">⚠️ mais de 48h sem atualizar: rodar o delta (scripts/realrisk-mls-backfill.ts --delta)</strong>' : ''
  }</p>
<ul>
<li><strong>${counts.novos}</strong> novos listados ${window}</li>
<li><strong>${counts.sairamDoMercado}</strong> saíram do mercado ${window}</li>
<li><strong>${counts.reducaoPreco}</strong> ativos com redução de preço</li>
<li><strong>${counts.ativos}</strong> ativos · <strong>${counts.sobContrato}</strong> sob contrato</li>
</ul>
<h3>Novos ${window} (top ${TOP_N})</h3>
${rowsHtml(tabs.novos.slice(0, TOP_N), false)}
<h3>Maiores reduções de preço (top ${TOP_N})</h3>
${rowsHtml(tabs.reducaoPreco.slice(0, TOP_N), true)}
<p style="color:#666;font-size:12px;margin-top:24px">Planilha completa em anexo. Fonte: Stellar MLS via MLS Grid.
Uso interno (Lucas/Jales) — não redistribuir sem checar o acordo de dados do Stellar.</p>
</div>`

  const text = [
    `RealRisk — resumo diário do MLS (dados até ${asOfText})${stale ? ' — ATENÇÃO: dados desatualizados' : ''}`,
    `${counts.novos} novos ${window}; ${counts.sairamDoMercado} saíram do mercado; ${counts.reducaoPreco} com redução de preço;`,
    `${counts.ativos} ativos; ${counts.sobContrato} sob contrato. Planilha completa em anexo.`,
  ].join('\n')

  return {
    subject,
    html,
    text,
    attachment: { filename: `realrisk-mls-${new Date().toISOString().slice(0, 10)}.xlsx`, content: Buffer.from(buffer) },
    counts,
    dataAsOf,
  }
}

export function digestRecipients(): string[] {
  return (process.env.REALRISK_DIGEST_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export type SendDigestResult =
  | { sent: true; id: string | null; to: string[]; counts: RealriskDigest['counts'] }
  | { sent: false; reason: string; counts?: RealriskDigest['counts'] }

export async function sendRealriskDigest(options: { days?: number } = {}): Promise<SendDigestResult> {
  const to = digestRecipients()
  if (!to.length) return { sent: false, reason: 'REALRISK_DIGEST_TO not set' }
  const resend = getResend()
  if (!resend) return { sent: false, reason: 'RESEND_API_KEY not set' }

  const digest = await buildRealriskDigest(options)
  const { data, error } = await resend.emails.send({
    from: process.env.REALRISK_DIGEST_FROM ?? FROM_ADDRESS,
    to,
    subject: digest.subject,
    html: digest.html,
    text: digest.text,
    attachments: [digest.attachment],
  })
  if (error) throw new Error(`Resend: ${error.message}`)
  return { sent: true, id: data?.id ?? null, to, counts: digest.counts }
}
