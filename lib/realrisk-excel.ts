// lib/realrisk-excel.ts — management spreadsheet over mls_listings (RealRisk)
//
// Used by GET /api/realrisk/export and scripts/realrisk-export.ts.
// Internal use only (Lucas/Jales): check the Stellar MLS Participant Data
// Access Agreement before sending this file to anyone outside.

import ExcelJS from 'exceljs'
import type { MlsListing } from '@prisma/client'
import prisma from '@/lib/prisma'

const NAVY = 'FF174079'
const HEADER_ROW = 4 // rows 1–2 title/subtitle, row 3 blank

const ACTIVE_STATUSES = ['Active']
const CONTRACT_STATUSES = ['Pending', 'Active Under Contract']
const OFF_MARKET_STATUSES = ['Withdrawn', 'Expired', 'Canceled', 'Cancelled']

export interface RealriskExportOptions {
  days?: number // window for "Novos" and "Saíram do mercado" (default 7)
  county?: string
}

// Rentals aren't purchase opportunities — keep them out of the spreadsheet.
export async function loadRealriskListings(options: RealriskExportOptions = {}) {
  return prisma.mlsListing.findMany({
    where: {
      propertyType: { notIn: ['Residential Lease', 'Commercial Lease'] },
      ...(options.county ? { county: options.county } : {}),
    },
  })
}

const DAY_MS = 86_400_000

function num(d: { toNumber(): number } | null): number | null {
  return d == null ? null : d.toNumber()
}

function domToday(l: MlsListing): number | null {
  // daysOnMarket is frozen at the listing's last modification — recompute.
  if (l.listingContractDate) return Math.max(0, Math.floor((Date.now() - l.listingContractDate.getTime()) / DAY_MS))
  return l.daysOnMarket
}

function priceCut(l: MlsListing): number | null {
  const list = num(l.listPrice)
  const orig = num(l.originalListPrice)
  if (!list || !orig || list >= orig) return null
  return (orig - list) / orig
}

// Cuts this deep are almost always an OriginalListPrice typo ($45M → $4.5M)
// or a parcel split off a bulk listing — rank them last, don't hide them.
const SUSPECT_CUT = 0.7

function cutRank(l: MlsListing): number {
  const cut = priceCut(l) ?? 0
  return cut >= SUSPECT_CUT ? cut - 1 : cut
}

function pricePerSqft(l: MlsListing): number | null {
  const price = num(l.listPrice)
  return price && l.livingArea ? price / l.livingArea : null
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const LISTING_COLUMNS: Array<Partial<ExcelJS.Column> & { key: string }> = [
  { header: 'MLS #', key: 'listingId', width: 14 },
  { header: 'Status', key: 'status', width: 20 },
  { header: 'Tipo', key: 'type', width: 16 },
  { header: 'Subtipo', key: 'subType', width: 22 },
  { header: 'Endereço', key: 'address', width: 32 },
  { header: 'Cidade', key: 'city', width: 16 },
  { header: 'Condado', key: 'county', width: 10 },
  { header: 'ZIP', key: 'zip', width: 8 },
  { header: 'Preço', key: 'price', width: 13, style: { numFmt: '$#,##0' } },
  { header: 'Preço original', key: 'origPrice', width: 13, style: { numFmt: '$#,##0' } },
  { header: '% redução', key: 'cut', width: 10, style: { numFmt: '0.0%' } },
  { header: '$/sqft', key: 'ppsf', width: 9, style: { numFmt: '$#,##0' } },
  { header: 'Quartos', key: 'beds', width: 8 },
  { header: 'Banheiros', key: 'baths', width: 9 },
  { header: 'Sqft', key: 'sqft', width: 8, style: { numFmt: '#,##0' } },
  { header: 'Acres', key: 'acres', width: 8, style: { numFmt: '#,##0.00' } },
  { header: 'Ano', key: 'year', width: 7 },
  { header: 'HOA/mês', key: 'hoa', width: 9, style: { numFmt: '$#,##0' } },
  { header: 'Imposto/ano', key: 'tax', width: 11, style: { numFmt: '$#,##0' } },
  { header: 'Flood zone', key: 'flood', width: 10 },
  { header: 'Água', key: 'water', width: 12 },
  { header: 'Esgoto', key: 'sewer', width: 14 },
  { header: 'DOM', key: 'dom', width: 7 },
  { header: 'Data de listagem', key: 'listed', width: 12, style: { numFmt: 'dd/mm/yyyy' } },
  { header: 'Primeira vez visto', key: 'firstSeen', width: 12, style: { numFmt: 'dd/mm/yyyy' } },
  { header: 'Corretora', key: 'office', width: 28 },
  { header: 'Corretor', key: 'agent', width: 22 },
]

function listingRow(l: MlsListing) {
  return {
    listingId: l.listingId,
    status: l.standardStatus,
    type: l.propertyType,
    subType: l.propertySubType,
    address: l.address?.trim(),
    city: l.city,
    county: l.county,
    zip: l.postalCode,
    price: num(l.listPrice),
    origPrice: num(l.originalListPrice),
    cut: priceCut(l),
    ppsf: pricePerSqft(l),
    beds: l.bedrooms,
    baths: l.bathrooms,
    sqft: l.livingArea,
    acres: num(l.lotSizeAcres),
    year: l.yearBuilt,
    hoa: num(l.hoaMonthly),
    tax: num(l.taxAnnual),
    flood: l.floodZone,
    water: l.waterSource,
    sewer: l.sewer,
    dom: domToday(l),
    listed: l.listingContractDate,
    firstSeen: l.firstSeenAt,
    office: l.listOfficeName,
    agent: l.listAgentFullName,
  }
}

function addTitle(sheet: ExcelJS.Worksheet, title: string, subtitle: string) {
  sheet.getCell('A1').value = `RealRisk — ${title}`
  sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY }, name: 'Calibri' }
  sheet.getCell('A2').value = subtitle
  sheet.getCell('A2').font = { size: 10, color: { argb: 'FF666666' }, name: 'Calibri' }
}

function styleHeaderRow(sheet: ExcelJS.Worksheet, columns: number) {
  const row = sheet.getRow(HEADER_ROW)
  row.height = 30
  for (let c = 1; c <= columns; c++) {
    const cell = row.getCell(c)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  }
}

// Header lives on row 4, so set widths/styles on columns WITHOUT `header`
// (ExcelJS would otherwise write the header into row 1, over the title).
function addListingSheet(
  wb: ExcelJS.Workbook,
  name: string,
  subtitle: string,
  listings: MlsListing[]
) {
  const sheet = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: HEADER_ROW, xSplit: 1 }] })
  sheet.columns = LISTING_COLUMNS.map(({ header: _h, ...col }) => col)
  addTitle(sheet, name, `${subtitle}   |   ${listings.length.toLocaleString('pt-BR')} imóveis`)
  sheet.getRow(HEADER_ROW).values = LISTING_COLUMNS.map((c) => c.header as string)
  styleHeaderRow(sheet, LISTING_COLUMNS.length)
  for (const l of listings) sheet.addRow(listingRow(l))
  sheet.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW, column: LISTING_COLUMNS.length },
  }
}

function addSummarySheet(wb: ExcelJS.Workbook, listings: MlsListing[], days: number, subtitle: string) {
  const sheet = wb.addWorksheet('Resumo', { views: [{ state: 'frozen', ySplit: HEADER_ROW }] })
  const cols: Array<{ header: string; key: string; width: number; numFmt?: string }> = [
    { header: 'Condado', key: 'county', width: 12 },
    { header: 'Ativos', key: 'active', width: 9, numFmt: '#,##0' },
    { header: 'Sob contrato', key: 'contract', width: 11, numFmt: '#,##0' },
    { header: `Novos (${days}d)`, key: 'fresh', width: 10, numFmt: '#,##0' },
    { header: 'Com redução de preço', key: 'cuts', width: 12, numFmt: '#,##0' },
    { header: 'Preço mediano (ativos)', key: 'medPrice', width: 14, numFmt: '$#,##0' },
    { header: '$/sqft mediano (residencial ativo)', key: 'medPpsf', width: 16, numFmt: '$#,##0' },
    { header: 'DOM médio (ativos)', key: 'avgDom', width: 11, numFmt: '0' },
    { header: 'Terrenos ativos', key: 'land', width: 10, numFmt: '#,##0' },
    { header: 'Terrenos ≥ 20 acres', key: 'land20', width: 11, numFmt: '#,##0' },
  ]
  sheet.columns = cols.map(({ key, width, numFmt }) => ({ key, width, style: numFmt ? { numFmt } : {} }))
  addTitle(sheet, 'Resumo por condado', subtitle)
  sheet.getRow(HEADER_ROW).values = cols.map((c) => c.header)
  styleHeaderRow(sheet, cols.length)

  const since = Date.now() - days * DAY_MS
  const counties = Array.from(new Set(listings.map((l) => l.county ?? "—"))).sort()
  const summarize = (county: string, rows: MlsListing[]) => {
    const active = rows.filter((l) => ACTIVE_STATUSES.includes(l.standardStatus))
    const doms = active.map(domToday).filter((d): d is number => d != null)
    const land = active.filter((l) => l.propertyType === 'Land')
    return {
      county,
      active: active.length,
      contract: rows.filter((l) => CONTRACT_STATUSES.includes(l.standardStatus)).length,
      fresh: active.filter((l) => l.listingContractDate && l.listingContractDate.getTime() >= since).length,
      cuts: active.filter((l) => priceCut(l) != null).length,
      medPrice: median(active.map((l) => num(l.listPrice)).filter((p): p is number => !!p)),
      medPpsf: median(
        active
          .filter((l) => l.propertyType === 'Residential')
          .map(pricePerSqft)
          .filter((p): p is number => p != null)
      ),
      avgDom: doms.length ? doms.reduce((a, b) => a + b, 0) / doms.length : null,
      land: land.length,
      land20: land.filter((l) => (num(l.lotSizeAcres) ?? 0) >= 20).length,
    }
  }
  for (const county of counties) sheet.addRow(summarize(county, listings.filter((l) => (l.county ?? '—') === county)))
  const total = sheet.addRow(summarize('Total', listings))
  total.font = { bold: true }

  sheet.addRow([])
  sheet.addRow(['Fonte: Stellar MLS via MLS Grid. Uso interno (Lucas/Jales) — não redistribuir sem checar o acordo de dados do Stellar.'])
  sheet.addRow(['Aluguéis (Residential/Commercial Lease) excluídos. DOM recalculado a partir da data de listagem.'])
}

export async function buildRealriskWorkbook(
  listings: MlsListing[],
  options: RealriskExportOptions = {}
): Promise<ArrayBuffer> {
  const days = options.days ?? 7
  const generated = `Gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/New_York' })} (horário da Flórida)`

  const wb = new ExcelJS.Workbook()
  wb.creator = 'RealRisk'
  wb.created = new Date()

  addSummarySheet(wb, listings, days, generated)

  const tabs = partitionRealriskListings(listings, days)
  addListingSheet(wb, 'Novos', `Listados no MLS nos últimos ${days} dias`, tabs.novos)
  addListingSheet(wb, 'Ativos', 'StandardStatus = Active', tabs.ativos)
  addListingSheet(wb, 'Sob contrato', 'Pending / Active Under Contract', tabs.sobContrato)
  addListingSheet(
    wb,
    'Redução de preço',
    `Ativos com preço abaixo do original — maior redução primeiro; reduções ≥ ${SUSPECT_CUT * 100}% (typo no MLS ou lote desmembrado) vão para o fim`,
    tabs.reducaoPreco
  )
  addListingSheet(
    wb,
    'Saíram do mercado',
    `Withdrawn / Expired / Canceled nos últimos ${days} dias (depende do sync --delta)`,
    tabs.sairamDoMercado
  )

  return wb.xlsx.writeBuffer()
}

// Shared by the workbook tabs and the daily email digest (lib/realrisk-digest.ts),
// so both always agree on what "new" / "price cut" / "off market" mean.
export function partitionRealriskListings(listings: MlsListing[], days = 7) {
  const since = Date.now() - days * DAY_MS
  const byListedDesc = (a: MlsListing, b: MlsListing) =>
    (b.listingContractDate?.getTime() ?? 0) - (a.listingContractDate?.getTime() ?? 0)

  return {
    // "Novos" uses the MLS listing date, not firstSeenAt: the initial backfill
    // stamped every row with the same firstSeenAt.
    novos: listings
      .filter((l) => ACTIVE_STATUSES.includes(l.standardStatus) && (l.listingContractDate?.getTime() ?? 0) >= since)
      .sort(byListedDesc),
    ativos: listings.filter((l) => ACTIVE_STATUSES.includes(l.standardStatus)).sort(byListedDesc),
    sobContrato: listings.filter((l) => CONTRACT_STATUSES.includes(l.standardStatus)).sort(byListedDesc),
    reducaoPreco: listings
      .filter((l) => ACTIVE_STATUSES.includes(l.standardStatus) && priceCut(l) != null)
      .sort((a, b) => cutRank(b) - cutRank(a)),
    sairamDoMercado: listings.filter(
      (l) => OFF_MARKET_STATUSES.includes(l.standardStatus) && l.modificationTimestamp.getTime() >= since
    ),
  }
}

export { priceCut, SUSPECT_CUT }
