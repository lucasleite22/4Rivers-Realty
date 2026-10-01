// lib/mls-sync.ts — shared upsert logic for MLSGrid → Property
//
// Used by both app/api/cron/mls-sync (incremental delta) and
// app/api/cron/mls-reconcile (periodic full sweep of already-synced
// listings). Kept in one place so the compliance rules below can't drift
// between the two jobs.

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { saveMlsImage } from '@/lib/upload'
import {
  MLS_TYPE_MAP,
  fetchProperties,
  fetchNextPage,
  type MlsListing,
  type MlsStatus,
  type MlsPropertyTypeFilter,
} from '@/services/mlsgrid.service'

export const ORIGINATING_SYSTEM = 'mfrmls'
export const TARGET_COUNTIES = ['Marion', 'Sumter']

// For now we only want to build inventory out of what's actually available
// or in negotiation — not flood new imports with years-old Closed/Withdrawn
// listings from the 2020+ backfill window. See upsertListing's
// skippedAlreadySold guard for the matching rule on the create path.
export const DEFAULT_SYNC_STATUSES: MlsStatus[] = ['Active', 'Pending', 'Active Under Contract']

// Statuses that mean "no longer legitimate active inventory" but aren't a
// sale (a sale — Closed — stays visible as SOLD, same as our own agent
// listings). These get unpublished, not deleted: MlgCanView is still true,
// so MLS Grid still authorizes us to retain the record.
export const OFF_MARKET_HIDE_STATUSES = ['Withdrawn', 'Expired', 'Canceled', 'Cancelled']

// MLSGrid media URLs are signed and expire within hours (confirmed empirically
// — see saveMlsImage below), so every photo has to be downloaded and
// re-hosted in Vercel Blob before it's usable as a permanent property image.
// Capped per listing so one run can't spend its whole time budget re-hosting
// photos for a single property.
export const MAX_IMAGES_PER_LISTING = 8

export type UpsertResult =
  | 'created'
  | 'updated'
  | 'removed'
  | 'unpublishedNotIdx'
  | 'skippedNotAuthorized'
  | 'skippedOffMarket'
  | 'skippedAlreadySold'

function mapMlsStatusToPropertyStatus(standardStatus: string): 'ACTIVE' | 'SOLD' | 'UNDER_CONTRACT' {
  if (standardStatus === 'Closed') return 'SOLD'
  if (standardStatus === 'Pending' || standardStatus === 'Active Under Contract') return 'UNDER_CONTRACT'
  return 'ACTIVE'
}

function mapListingToPropertyData(listing: MlsListing) {
  const propertyType =
    MLS_TYPE_MAP[listing.PropertySubType ?? ''] ??
    MLS_TYPE_MAP[listing.PropertyType] ??
    'RESIDENTIAL'

  const address =
    listing.UnparsedAddress ||
    [listing.StreetNumber, listing.StreetName, listing.StreetSuffix].filter(Boolean).join(' ')

  return {
    title: address || listing.ListingId,
    type: propertyType as Prisma.PropertyCreateInput['type'],
    status: mapMlsStatusToPropertyStatus(listing.StandardStatus),
    mlsStatus: listing.StandardStatus,
    mlsListOfficeName: listing.ListOfficeName ?? null,
    mlsListAgentFullName: listing.ListAgentFullName ?? null,
    priceUsd: new Prisma.Decimal(listing.ListPrice ?? 0),
    acreage: new Prisma.Decimal(listing.LotSizeAcres ?? 0),
    county: listing.CountyOrParish ?? '',
    city: listing.City,
    address: address || 'See MLS listing',
    description: listing.PublicRemarks ?? '',
    latitude: listing.Latitude ?? null,
    longitude: listing.Longitude ?? null,
    bedrooms: listing.BedroomsTotal ?? null,
    bathrooms: listing.BathroomsTotalInteger ?? null,
    sqft: listing.LivingArea ?? null,
    yearBuilt: listing.YearBuilt ?? null,
  }
}

export async function upsertListing(listing: MlsListing): Promise<UpsertResult> {
  const existing = await prisma.property.findUnique({ where: { mlsId: listing.ListingKey } })

  // MLS Grid: MlgCanView false means we are no longer authorized to retain
  // this record at all — not "hide it", remove it. Their own feed drops it
  // entirely after 7 days; we don't wait, we drop our copy as soon as we see it.
  if (!listing.MlgCanView) {
    if (existing) {
      await prisma.property.delete({ where: { id: existing.id } }) // cascades to PropertyImage
      return 'removed'
    }
    return 'skippedNotAuthorized'
  }

  // MlgCanView true only means "you may keep this record" — public IDX
  // display additionally requires 'IDX' in MlgCanUse. A record authorized
  // only for VOW/CRM use must never appear on the public site.
  const idxAuthorized = (listing.MlgCanUse ?? []).includes('IDX')
  if (!idxAuthorized) {
    if (existing?.showOnPortal) {
      await prisma.property.update({ where: { id: existing.id }, data: { showOnPortal: false } })
      return 'unpublishedNotIdx'
    }
    return 'skippedNotAuthorized'
  }

  const data = mapListingToPropertyData(listing)
  const forceHide = OFF_MARKET_HIDE_STATUSES.includes(listing.StandardStatus)

  if (existing) {
    // Every other admin curation field (featured, showOnPortal when it was
    // a deliberate choice) is left alone — except we force showOnPortal
    // false when the listing goes Withdrawn/Expired/Canceled, since
    // continuing to advertise those as available isn't a curation call,
    // it's a data-accuracy requirement.
    await prisma.property.update({
      where: { id: existing.id },
      data: forceHide ? { ...data, showOnPortal: false } : data,
    })
    return 'updated'
  }

  if (forceHide) {
    // First time we've seen this listing and it's already off-market —
    // nothing to import.
    return 'skippedOffMarket'
  }

  if (listing.StandardStatus === 'Closed') {
    // First time we've seen this listing and it's already sold — we had no
    // part in that sale, so importing it would misrepresent a stranger's
    // closed deal as 4Rivers inventory. The initial backfill pulls every
    // listing modified since 2020, which otherwise floods new imports with
    // years-old sales. A listing we're ALREADY tracking that later closes
    // still goes through the `existing` branch above and is kept as SOLD —
    // this only blocks adopting someone else's old sale from scratch.
    return 'skippedAlreadySold'
  }

  const created = await prisma.property.create({
    data: { ...data, mlsId: listing.ListingKey, source: 'MLS', showOnPortal: false, featured: false },
  })

  // Only public-permission photos, capped per listing, and only on first
  // import — refreshing photos on every subsequent update is a later pass
  // (photo set rarely churns after initial sync for a given listing).
  const media = (listing.Media ?? [])
    .filter((m) => !m.Permission || m.Permission.includes('Public'))
    .slice(0, MAX_IMAGES_PER_LISTING)

  for (let i = 0; i < media.length; i++) {
    try {
      const url = await saveMlsImage(media[i].MediaURL, listing.ListingKey, i)
      await prisma.propertyImage.create({
        data: { propertyId: created.id, url, isCover: i === 0, sortOrder: media[i].Order ?? i },
      })
    } catch (err) {
      // One bad photo shouldn't fail the whole listing import.
      console.error(`[mls-sync] failed to re-host photo for ${listing.ListingKey}`, err)
    }
  }
  return 'created'
}

// ── Shared runner: one bounded sync pass against the live API ──
//
// Used by both app/api/cron/mls-sync (daily, default filters, advances the
// shared delta cursor) and app/api/admin/mls-sync (manual trigger from the
// admin panel, with operator-chosen status/type filters — see
// updateCursor below for why those runs don't touch the cursor).

export interface MlsSyncStats {
  created: number
  updated: number
  removed: number
  unpublishedNotIdx: number
  skippedNotAuthorized: number
  skippedOffMarket: number
  skippedAlreadySold: number
  skippedOutOfArea: number
  pagesProcessed: number
}

export interface RunMlsSyncOptions {
  statuses: MlsStatus[]
  propertyType?: MlsPropertyTypeFilter
  maxPages: number
  // The delta cursor (mlsSyncState.lastModificationTimestamp) is shared
  // across ALL sync runs for this OriginatingSystem — it's what lets the
  // next run pick up only what changed since the last one. If a
  // narrower-than-default run (e.g. admin filtering to just "Commercial")
  // advanced that cursor, the next default-filter run would silently skip
  // every non-Commercial listing modified during that window forever.
  // Only a run using the exact default filters (no propertyType, full
  // status set) is safe to advance it — admin runs with custom filters
  // must pass false.
  updateCursor: boolean
}

export async function runMlsSync(options: RunMlsSyncOptions): Promise<MlsSyncStats> {
  const { statuses, propertyType, maxPages, updateCursor } = options
  const stats: MlsSyncStats = {
    created: 0,
    updated: 0,
    removed: 0,
    unpublishedNotIdx: 0,
    skippedNotAuthorized: 0,
    skippedOffMarket: 0,
    skippedAlreadySold: 0,
    skippedOutOfArea: 0,
    pagesProcessed: 0,
  }
  let latestModificationTimestamp: string | undefined

  const state = await prisma.mlsSyncState.findUnique({
    where: { originatingSystemName: ORIGINATING_SYSTEM },
  })
  const modifiedSince = state?.lastModificationTimestamp.toISOString() ?? '2020-01-01T00:00:00.00Z'

  try {
    let page = await fetchProperties({
      modifiedSince,
      status: statuses,
      propertyType,
      top: 100,
      expand: ['Media'],
    })

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      stats.pagesProcessed++

      for (const listing of page.listings) {
        latestModificationTimestamp = listing.ModificationTimestamp

        if (!listing.CountyOrParish || !TARGET_COUNTIES.includes(listing.CountyOrParish)) {
          stats.skippedOutOfArea++
          continue
        }

        const result = await upsertListing(listing)
        stats[result]++
      }

      if (!page.nextLink) break
      page = await fetchNextPage(page.nextLink)
    }

    if (updateCursor) {
      await prisma.mlsSyncState.upsert({
        where: { originatingSystemName: ORIGINATING_SYSTEM },
        create: {
          originatingSystemName: ORIGINATING_SYSTEM,
          lastModificationTimestamp: latestModificationTimestamp
            ? new Date(latestModificationTimestamp)
            : new Date(modifiedSince),
          lastRunStatus: 'success',
        },
        update: {
          ...(latestModificationTimestamp ? { lastModificationTimestamp: new Date(latestModificationTimestamp) } : {}),
          lastRunAt: new Date(),
          lastRunStatus: 'success',
          lastRunError: null,
        },
      })

      if (stats.created > 0) {
        await prisma.dashboardEvent.create({
          data: {
            type: 'PROPERTY_CREATED',
            entityId: ORIGINATING_SYSTEM,
            entityType: 'MlsSync',
            metadata: { ...stats },
          },
        })
      }
    }

    return stats
  } catch (err) {
    if (updateCursor) {
      await prisma.mlsSyncState.upsert({
        where: { originatingSystemName: ORIGINATING_SYSTEM },
        create: {
          originatingSystemName: ORIGINATING_SYSTEM,
          lastModificationTimestamp: new Date(modifiedSince),
          lastRunStatus: 'error',
          lastRunError: err instanceof Error ? err.message : String(err),
        },
        update: {
          lastRunAt: new Date(),
          lastRunStatus: 'error',
          lastRunError: err instanceof Error ? err.message : String(err),
        },
      })
    }
    throw err
  }
}
