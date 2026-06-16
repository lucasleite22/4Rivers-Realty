import ExcelJS from 'exceljs'
import type { Lead, Property } from '@prisma/client'

// ── Shared helpers ────────────────────────────────────────────

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF174079' }, // navy
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  name: 'Calibri',
  size: 11,
}

function styleHeader(sheet: ExcelJS.Worksheet, columns: number) {
  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell, col) => {
    if (col > columns) return
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF00AEEF' } },
    }
  })
  headerRow.height = 22
}

function styleDataRows(sheet: ExcelJS.Worksheet) {
  sheet.eachRow((row, idx) => {
    if (idx === 1) return
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' }
      cell.font = { name: 'Calibri', size: 10 }
    })
    if (idx % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F7FC' }, // site-bg light blue
        }
      })
    }
  })
}

function addLogoHeader(sheet: ExcelJS.Worksheet, title: string, subtitle: string) {
  sheet.mergeCells('A1:H1')
  const titleRow = sheet.getRow(1)
  titleRow.getCell(1).value = `4Rivers Realty — ${title}`
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF174079' }, name: 'Calibri' }
  titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
  titleRow.height = 28

  sheet.mergeCells('A2:H2')
  const subRow = sheet.getRow(2)
  subRow.getCell(1).value = subtitle
  subRow.getCell(1).font = { size: 10, color: { argb: 'FF666666' }, name: 'Calibri' }
  subRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
  subRow.height = 18

  sheet.addRow([]) // blank separator
}

// ── Export Leads ──────────────────────────────────────────────

export interface LeadExportFilters {
  from?: Date
  to?: Date
  status?: string
  origin?: string
}

export async function exportLeadsToBuffer(
  leads: Lead[],
  filters: LeadExportFilters = {}
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = '4Rivers Realty'
  wb.created = new Date()

  const sheet = wb.addWorksheet('Leads', {
    views: [{ state: 'frozen', ySplit: 4 }], // freeze header rows
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  // Title block
  const subtitle = buildSubtitle('Leads', filters)
  addLogoHeader(sheet, 'Lead Pipeline Export', subtitle)

  // Column definitions
  sheet.columns = [
    { header: 'Name',             key: 'name',             width: 22 },
    { header: 'Email',            key: 'email',            width: 28 },
    { header: 'Phone',            key: 'phone',            width: 16 },
    { header: 'Type',             key: 'type',             width: 12 },
    { header: 'Origin',           key: 'origin',           width: 14 },
    { header: 'Status',           key: 'status',           width: 18 },
    { header: 'Property Interest',key: 'propertyInterest', width: 24 },
    { header: 'Budget (USD)',      key: 'budgetUsd',        width: 14 },
    { header: 'Acreage Desired',  key: 'acreageDesired',   width: 16 },
    { header: 'County Preferred', key: 'countyPreferred',  width: 16 },
    { header: 'Notes',            key: 'notes',            width: 40 },
    { header: 'Last Contact',     key: 'lastContactAt',    width: 16 },
    { header: 'Created',          key: 'createdAt',        width: 16 },
  ]

  styleHeader(sheet, sheet.columns.length)

  leads.forEach((lead) => {
    sheet.addRow({
      name:             lead.name,
      email:            lead.email ?? '',
      phone:            lead.phone ?? '',
      type:             lead.type,
      origin:           lead.origin,
      status:           lead.status,
      propertyInterest: lead.propertyInterest ?? '',
      budgetUsd:        lead.budgetUsd ? Number(lead.budgetUsd) : '',
      acreageDesired:   lead.acreageDesired ? Number(lead.acreageDesired) : '',
      countyPreferred:  lead.countyPreferred ?? '',
      notes:            lead.notes ?? '',
      lastContactAt:    lead.lastContactAt ? fmtDate(lead.lastContactAt) : '',
      createdAt:        fmtDate(lead.createdAt),
    })
  })

  styleDataRows(sheet)

  // Auto-filter on header row (row 4 = after 3 header rows)
  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to:   { row: 4, column: sheet.columns.length },
  }

  return wb.xlsx.writeBuffer() as Promise<Buffer>
}

// ── Export Properties ─────────────────────────────────────────

export async function exportPropertiesToBuffer(
  properties: Property[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = '4Rivers Realty'
  wb.created = new Date()

  const sheet = wb.addWorksheet('Properties', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  addLogoHeader(sheet, 'Property Portfolio Export', `Generated ${fmtDate(new Date())}`)

  sheet.columns = [
    { header: 'Title',    key: 'title',    width: 30 },
    { header: 'Type',     key: 'type',     width: 14 },
    { header: 'Status',   key: 'status',   width: 16 },
    { header: 'Price ($)',key: 'priceUsd', width: 14 },
    { header: 'Acreage',  key: 'acreage',  width: 10 },
    { header: 'City',     key: 'city',     width: 16 },
    { header: 'County',   key: 'county',   width: 14 },
    { header: 'Address',  key: 'address',  width: 32 },
    { header: 'Stables',  key: 'stables',  width: 10 },
    { header: 'Arenas',   key: 'arenas',   width: 10 },
    { header: 'Pastures', key: 'pastures', width: 10 },
    { header: 'Featured', key: 'featured', width: 10 },
    { header: 'MLS ID',   key: 'mlsId',    width: 16 },
    { header: 'Created',  key: 'createdAt',width: 16 },
  ]

  styleHeader(sheet, sheet.columns.length)

  properties.forEach((p) => {
    sheet.addRow({
      title:     p.title,
      type:      p.type,
      status:    p.status,
      priceUsd:  Number(p.priceUsd),
      acreage:   Number(p.acreage),
      city:      p.city,
      county:    p.county,
      address:   p.address,
      stables:   p.stables ?? '',
      arenas:    p.arenas ?? '',
      pastures:  p.pastures ?? '',
      featured:  p.featured ? 'Yes' : 'No',
      mlsId:     (p as unknown as { mlsId?: string }).mlsId ?? '',
      createdAt: fmtDate(p.createdAt),
    })
  })

  styleDataRows(sheet)

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to:   { row: 4, column: sheet.columns.length },
  }

  return wb.xlsx.writeBuffer() as Promise<Buffer>
}

// ── Helpers ───────────────────────────────────────────────────

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function buildSubtitle(entity: string, filters: LeadExportFilters) {
  const parts: string[] = [`Generated ${fmtDate(new Date())}`]
  if (filters.from) parts.push(`From: ${fmtDate(filters.from)}`)
  if (filters.to)   parts.push(`To: ${fmtDate(filters.to)}`)
  if (filters.status) parts.push(`Status: ${filters.status}`)
  if (filters.origin) parts.push(`Origin: ${filters.origin}`)
  return parts.join('   |   ')
}
