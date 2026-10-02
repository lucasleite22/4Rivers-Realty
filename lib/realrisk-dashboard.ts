// lib/realrisk-dashboard.ts — mls_listings → RealRisk dashboard properties
//
// Shared by GET /api/realrisk/listings (the dashboard inside /admin/realrisk)
// and scripts/realrisk-dashboard-data.ts (local data-mls.js for testing).
//
// Fix & Flip only — the dashboard's financial model is flip ROI. Criteria are
// the ones Jales filled in "Critérios de Elegibilidade _rev1" ("Sua
// definição" column only): Sumter/Marion/Lake/Polk, Single Family, Flood X.
//
// ARV and CAPEX are ROUGH ESTIMATES until we have Closed comparables
// (phase 2): ARV = asking $/sqft of similar-size homes in the ZIP × sqft;
// CAPEX by year built.

import type { MlsListing } from '@prisma/client'
import prisma from '@/lib/prisma'

const FLIP_COUNTIES = ['Sumter', 'Marion', 'Lake', 'Polk']
const MIN_ZIP_COMPS = 10
const MIN_SIZE_COMPS = 5
const DAY_MS = 86_400_000

const NEW_ROOF =
  /(new|newer|brand new)\s+(\w+\s+)?roof|roof\s+(was\s+)?(replaced|installed|new)\s+(in\s+)?20(2[1-6])|20(2[1-6])\s+roof/i
const NEW_HVAC =
  /(new|newer)\s+(\w+\s+)?(hvac|a\/c|ac unit|air condition)|(hvac|a\/c)\s+(was\s+)?(replaced|installed|new)\s+(in\s+)?20(2[1-6])|20(2[1-6])\s+(hvac|a\/c)/i

export interface DashboardProperty {
  id: number
  mlsId: string
  address: string
  city: string
  zip: string | null
  lat: number | null
  lng: number | null
  price: number
  sqft: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number | null
  daysOnMarket: number
  hoaMonthly: number
  propertyTaxAnnual: number
  capexEstimated: number
  arvEstimated: number
  floodZone: string | null
  roofAgeYears: number | null
  hvacAgeYears: number | null
  strAllowed: boolean
  listOfficeName: string | null
  listAgentFullName: string | null
  description: string
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// The dashboard injects description as HTML — MLS remarks are untrusted text.
function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  )
}

// Rough renovation budget per sqft by age — placeholder until Jales defines it.
function capexPerSqft(yearBuilt: number | null): number {
  if (!yearBuilt) return 25
  if (yearBuilt < 1980) return 35
  if (yearBuilt < 2000) return 25
  if (yearBuilt < 2015) return 15
  return 8
}

// Stable numeric id (the dashboard parses ids as ints, and likes/comments in
// Supabase are keyed by it): the digits of ListingKey, e.g. MFR585171452.
function stableId(listingKey: string): number {
  return Number(listingKey.replace(/\D/g, ''))
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

const ppsf = (l: MlsListing) => Number(l.listPrice) / l.livingArea!

export async function buildDashboardProperties(limit = 300): Promise<DashboardProperty[]> {
  const rows = await prisma.mlsListing.findMany({
    where: {
      standardStatus: 'Active',
      county: { in: FLIP_COUNTIES },
      propertySubType: 'Single Family Residence',
      livingArea: { gte: 600 },
      listPrice: { gt: 0 },
      latitude: { not: null },
      postalCode: { not: null },
    },
  })

  const byZip = new Map<string, MlsListing[]>()
  for (const l of rows) byZip.set(l.postalCode!, [...(byZip.get(l.postalCode!) ?? []), l])

  // Bigger homes sell for less per sqft — compare against same-ZIP homes of
  // similar size (±30%) when there are enough, else the whole ZIP.
  function comparablePpsf(l: MlsListing): number | null {
    const zip = byZip.get(l.postalCode!)!
    if (zip.length < MIN_ZIP_COMPS) return null
    const size = l.livingArea!
    const similar = zip.filter((o) => o !== l && Math.abs(o.livingArea! - size) <= size * 0.3).map(ppsf)
    return median(similar.length >= MIN_SIZE_COMPS ? similar : zip.map(ppsf))
  }

  const candidates = rows
    .filter((l) => l.floodZone === 'X')
    .map((l) => ({ l, compPpsf: comparablePpsf(l) }))
    .filter((c): c is { l: MlsListing; compPpsf: number } => c.compPpsf != null)
    .map((c) => ({ ...c, discount: 1 - ppsf(c.l) / c.compPpsf }))
    // ≥10% below comparables is the opportunity signal; >50% is usually bad
    // data or a teardown — leave those out.
    .filter((c) => c.discount >= 0.1 && c.discount <= 0.5)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit)

  return candidates.map(({ l, compPpsf, discount }) => {
    const remarks = l.publicRemarks ?? ''
    const listPrice = Number(l.listPrice)
    const original = l.originalListPrice ? Number(l.originalListPrice) : null
    const notes = [
      `MLS ${l.listingId} · ${l.county} County · ${l.yearBuilt ?? 'ano ?'}`,
      `$/sqft ${Math.round(discount * 100)}% abaixo de casas de tamanho parecido no ZIP ($${Math.round(compPpsf)}/sqft).`,
      original && original > listPrice
        ? `Redução de preço: $${original.toLocaleString('en-US')} → $${listPrice.toLocaleString('en-US')}.`
        : '',
      'ARV e CAPEX são estimativas (preço pedido de casas parecidas no ZIP; CAPEX por idade) — não são comparáveis vendidos.',
      `Listado por ${l.listOfficeName ?? '—'} (${l.listAgentFullName ?? '—'}). Fonte: Stellar MLS.`,
      remarks,
    ]
    return {
      id: stableId(l.listingKey),
      mlsId: l.listingId,
      address: (l.address ?? '').trim(),
      city: l.city ? titleCase(l.city) : '',
      zip: l.postalCode,
      lat: l.latitude,
      lng: l.longitude,
      price: listPrice,
      sqft: l.livingArea!,
      bedrooms: l.bedrooms ?? 0,
      bathrooms: l.bathrooms ?? 0,
      yearBuilt: l.yearBuilt,
      // daysOnMarket is frozen at the listing's last modification — recompute.
      daysOnMarket: l.listingContractDate
        ? Math.max(0, Math.floor((Date.now() - l.listingContractDate.getTime()) / DAY_MS))
        : l.daysOnMarket ?? 0,
      hoaMonthly: l.hoaMonthly ? Math.round(Number(l.hoaMonthly)) : 0,
      propertyTaxAnnual: l.taxAnnual ? Math.round(Number(l.taxAnnual)) : 0,
      capexEstimated: Math.round(capexPerSqft(l.yearBuilt) * l.livingArea!),
      arvEstimated: Math.round(compPpsf * l.livingArea!),
      floodZone: l.floodZone,
      // No roof/HVAC age in the MLS: ~2 when the remarks say "new roof/AC",
      // otherwise null (scoring.js treats unknown as mid-range).
      roofAgeYears: NEW_ROOF.test(remarks) ? 2 : null,
      hvacAgeYears: NEW_HVAC.test(remarks) ? 2 : null,
      // Proxy only: HOA lease rules, not zoning. Still needs manual check.
      strAllowed: l.leaseRestrictions === false && l.minimumLease === 'No Minimum',
      listOfficeName: l.listOfficeName,
      listAgentFullName: l.listAgentFullName,
      description: notes.filter(Boolean).map(escapeHtml).join('<br><br>'),
    }
  })
}
