// lib/mls-sync.ts — shared upsert logic for MLSGrid → Property
//
// Used by both app/api/cron/mls-sync (incremental delta) and
// app/api/cron/mls-reconcile (periodic full sweep of already-synced
// listings). Kept in one place so the compliance rules below can't drift
// between the two jobs.

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { saveMlsImage } from '@/lib/upload'
import { MLS_TYPE_MAP, type MlsListing } from '@/services/mlsgrid.service'

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
