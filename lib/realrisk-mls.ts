// lib/realrisk-mls.ts — MLSGrid → mls_listings (analytical data for RealRisk)
//
// Separate from the portal's Property inventory on purpose: no photos, no
// curation queue, just data the RealRisk dashboard scores. See
// MLS-INTEGRACAO.md in the realrisk-mvp repo for the full rationale.
//
// Two ways rows get here:
//  1. upsertMlsListing() is called from runMlsSync's page loop (lib/mls-sync.ts)
//     for every listing in REALRISK_COUNTIES — zero extra MLSGrid requests.
//  2. runRealriskSync() walks the feed with its OWN cursor
//     (REALRISK_SYNC_STATE) — used for the initial backfill, since the
//     portal's cursor is already past every old listing in the new counties.

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  fetchProperties,
  fetchNextPage,
  type MlsListing,
  type MlsStatus,
} from '@/services/mlsgrid.service'

// Counties Jales Castro defined in "Critérios de Elegibilidade _rev1"
// (Flip + Farmland + Ranch, "Sua definição" column only — the form's
// "Sugestão inicial" column is NOT a decision). Orange/Osceola/Seminole are
// deliberately out.
export const REALRISK_COUNTIES = ['Sumter', 'Marion', 'Lake', 'Polk', 'Pasco']

// Own MlsSyncState row — never touch the portal's 'mfrmls' cursor.
export const REALRISK_SYNC_STATE = 'mfrmls:realrisk'

// A listing we've never seen that's already in one of these states isn't
// worth creating. Closed is phase 2 (ARV comparables) — skip it for now.
const SKIP_NEW_STATUSES = ['Withdrawn', 'Expired', 'Canceled', 'Cancelled', 'Closed']

export type RealriskUpsertResult = 'created' | 'updated' | 'removed' | 'skipped'

export function isRealriskCounty(county?: string): boolean {
  return !!county && REALRISK_COUNTIES.includes(county)
}

function joinList(value?: string[] | string): string | null {
  if (value == null) return null
  const joined = Array.isArray(value) ? value.join(', ') : value
  return joined.trim() || null
}

function toNumber(value?: string | number | null): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function toYN(value?: string | boolean | null): boolean | null {
  if (value == null || value === '') return null
  if (typeof value === 'boolean') return value
  return value === '1' || value.toLowerCase() === 'true'
}

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function decimal(value: number | null, places = 2): Prisma.Decimal | null {
  return value == null ? null : new Prisma.Decimal(value.toFixed(places))
}

// MFR_MonthlyHOAAmount is already monthly; fall back to AssociationFee
// normalized by its frequency when Stellar's computed field is missing.
function hoaMonthly(listing: MlsListing): number | null {
  const mfr = toNumber(listing.MFR_MonthlyHOAAmount)
  const extra = toNumber(listing.MFR_MontlyMaintAmtAdditionToHOA) ?? 0
  if (mfr != null) return mfr + extra

  const fee = toNumber(listing.AssociationFee)
  if (fee == null) return null
  const divisor: Record<string, number> = {
    Monthly: 1,
    Quarterly: 3,
    'Semi-Annually': 6,
    Annually: 12,
  }
  return fee / (divisor[listing.AssociationFeeFrequency ?? 'Monthly'] ?? 1) + extra
}

function daysOnMarket(listing: MlsListing): number | null {
  const dom = toNumber(listing.DaysOnMarket) ?? toNumber(listing.CumulativeDaysOnMarket)
  if (dom != null) return dom
  const listed = toDate(listing.ListingContractDate)
  return listed ? Math.max(0, Math.floor((Date.now() - listed.getTime()) / 86_400_000)) : null
}

function mapListingToMlsListingData(listing: MlsListing) {
  const address =
    listing.UnparsedAddress ||
    [listing.StreetNumber, listing.StreetName, listing.StreetSuffix].filter(Boolean).join(' ')

  return {
    listingId: listing.ListingId,
    standardStatus: listing.StandardStatus,
    propertyType: listing.PropertyType,
    propertySubType: listing.PropertySubType ?? null,
    listPrice: decimal(toNumber(listing.ListPrice)),
    originalListPrice: decimal(toNumber(listing.OriginalListPrice)),
    closePrice: decimal(toNumber(listing.ClosePrice)),
    closeDate: toDate(listing.CloseDate),
    listingContractDate: toDate(listing.ListingContractDate),
    daysOnMarket: daysOnMarket(listing),
    address: address || null,
    city: listing.City ?? null,
    county: listing.CountyOrParish ?? null,
    postalCode: listing.PostalCode ?? null,
    latitude: listing.Latitude ?? null,
    longitude: listing.Longitude ?? null,
    bedrooms: toNumber(listing.BedroomsTotal),
    bathrooms: toNumber(listing.BathroomsTotalInteger),
    livingArea: toNumber(listing.LivingArea),
    lotSizeAcres: decimal(toNumber(listing.LotSizeAcres), 4),
    yearBuilt: toNumber(listing.YearBuilt),
    hoaMonthly: decimal(hoaMonthly(listing)),
    taxAnnual: decimal(toNumber(listing.TaxAnnualAmount)),
    taxYear: toNumber(listing.TaxYear),
    poolPrivate: toYN(listing.PoolPrivateYN),
    zoning: listing.Zoning ?? null,
    floodZone: listing.MFR_FloodZoneCode?.trim().toUpperCase() || null,
    leaseRestrictions: toYN(listing.MFR_LeaseRestrictionsYN),
    minimumLease: listing.MFR_MinimumLease ?? null,
    waterSource: joinList(listing.WaterSource),
    sewer: joinList(listing.Sewer),
    utilities: joinList(listing.Utilities),
    lotFeatures: joinList(listing.LotFeatures),
    publicRemarks: listing.PublicRemarks ?? null,
    listOfficeName: listing.ListOfficeName ?? null,
    listAgentFullName: listing.ListAgentFullName ?? null,
    mlgCanUse: joinList(listing.MlgCanUse),
    modificationTimestamp: new Date(listing.ModificationTimestamp),
  }
}

export async function upsertMlsListing(listing: MlsListing): Promise<RealriskUpsertResult> {
  // Same rule as the portal: MlgCanView false → we may not retain it at all.
  if (!listing.MlgCanView) {
    const { count } = await prisma.mlsListing.deleteMany({ where: { listingKey: listing.ListingKey } })
    return count > 0 ? 'removed' : 'skipped'
  }

  const data = mapListingToMlsListingData(listing)
  const existing = await prisma.mlsListing.findUnique({
    where: { listingKey: listing.ListingKey },
    select: { listingKey: true },
  })

  if (existing) {
    await prisma.mlsListing.update({ where: { listingKey: listing.ListingKey }, data })
    return 'updated'
  }
  if (SKIP_NEW_STATUSES.includes(listing.StandardStatus)) return 'skipped'

  await prisma.mlsListing.create({ data: { ...data, listingKey: listing.ListingKey } })
  return 'created'
}

// ── Standalone runner with its own cursor (backfill / catch-up) ──
//
// Persists the cursor after EVERY page, so it's safe to interrupt and
// resume. Every request goes through fetchProperties/fetchNextPage, which
// throttle to ~1.67 req/s — never call the MLSGrid API from here directly.

export interface RealriskSyncStats {
  created: number
  updated: number
  removed: number
  skipped: number
  outOfArea: number
  pagesProcessed: number
  cursor: string
  done: boolean
}

export interface RunRealriskSyncOptions {
  // Omit for an unfiltered delta (captures Withdrawn/Expired/Closed
  // transitions of rows we already have). The initial backfill passes
  // the active statuses only, to keep the 2020+ window small.
  statuses?: MlsStatus[]
  maxPages: number
  // Epoch ms: stop before fetching another page once past it. Lets a Vercel
  // function (60s cap) do as much as fits and leave the rest for next run —
  // the cursor only advances over what was actually processed.
  deadline?: number
  onPage?: (stats: RealriskSyncStats) => void
}

export async function runRealriskSync(options: RunRealriskSyncOptions): Promise<RealriskSyncStats> {
  const state = await prisma.mlsSyncState.findUnique({
    where: { originatingSystemName: REALRISK_SYNC_STATE },
  })
  const modifiedSince = state?.lastModificationTimestamp.toISOString() ?? '2020-01-01T00:00:00.00Z'

  const stats: RealriskSyncStats = {
    created: 0,
    updated: 0,
    removed: 0,
    skipped: 0,
    outOfArea: 0,
    pagesProcessed: 0,
    cursor: modifiedSince,
    done: false,
  }

  const saveCursor = (status: 'success' | 'error', error?: string) =>
    prisma.mlsSyncState.upsert({
      where: { originatingSystemName: REALRISK_SYNC_STATE },
      create: {
        originatingSystemName: REALRISK_SYNC_STATE,
        lastModificationTimestamp: new Date(stats.cursor),
        lastRunStatus: status,
        lastRunError: error ?? null,
      },
      update: {
        lastModificationTimestamp: new Date(stats.cursor),
        lastRunAt: new Date(),
        lastRunStatus: status,
        lastRunError: error ?? null,
      },
    })

  try {
    let page = await fetchProperties({ modifiedSince, status: options.statuses, top: 100 })

    for (let pageIndex = 0; pageIndex < options.maxPages; pageIndex++) {
      stats.pagesProcessed++

      for (const listing of page.listings) {
        if (isRealriskCounty(listing.CountyOrParish)) {
          stats[await upsertMlsListing(listing)]++
        } else {
          stats.outOfArea++
        }
        stats.cursor = listing.ModificationTimestamp
      }

      await saveCursor('success')
      options.onPage?.(stats)

      if (!page.nextLink) {
        stats.done = true
        break
      }
      if (options.deadline && Date.now() > options.deadline) break
      page = await fetchNextPage(page.nextLink)
    }
    return stats
  } catch (err) {
    await saveCursor('error', err instanceof Error ? err.message : String(err))
    throw err
  }
}
