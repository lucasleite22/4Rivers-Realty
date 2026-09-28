// GET /api/cron/mls-sync
//
// Invoked by Vercel Cron (see vercel.json) every 4 hours. Pulls the MLSGrid
// delta since the last successful run, keeps only Marion/Sumter listings
// (the API itself can't filter by county — see services/mlsgrid.service.ts),
// and upserts them into Property with source: 'MLS'.
//
// New listings land with showOnPortal: false / featured: false — an admin
// has to review and flip showOnPortal in the properties panel before they
// go live (see PATCH /api/properties/bulk for the batch-approve action).
// Updates to an already-synced listing only refresh its MLS-sourced fields —
// admin curation flags (showOnPortal/featured) are never overwritten once set.
//
// Not authenticated the normal admin way — protected by CRON_SECRET, the
// standard Vercel Cron pattern (Vercel sends `Authorization: Bearer
// $CRON_SECRET` automatically when the env var is set).

export const dynamic = 'force-dynamic'
// Needs the Vercel Pro plan to actually get 300s (Hobby caps functions at
// 10s); this route does real work per new listing (photo download+reupload
// to Blob), so the default 10s is not enough even for a handful of listings.
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { saveMlsImage } from '@/lib/upload'
import {
  fetchProperties,
  fetchNextPage,
  MLS_TYPE_MAP,
  type MlsListing,
} from '@/services/mlsgrid.service'

const ORIGINATING_SYSTEM = 'mfrmls'
const TARGET_COUNTIES = ['Marion', 'Sumter']

// MLSGrid media URLs are signed and expire within hours (confirmed empirically —
// see lib/upload.ts saveMlsImage), so every photo has to be downloaded and
// re-hosted in Vercel Blob before it's usable as a permanent property image.
// Capped per listing so one cron run can't spend its whole time budget
// re-hosting photos for a single property.
const MAX_IMAGES_PER_LISTING = 8

// Safety cap so one invocation can't run past the function timeout. Any
// remaining pages are picked up on the next cron tick — the cursor only
// advances up to what was actually processed in this run. Kept low because
// each new listing now does real work (photo download+reupload to Blob),
// not just a DB write.
const MAX_PAGES_PER_RUN = 5

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

async function upsertListing(listing: MlsListing) {
  const data = mapListingToPropertyData(listing)
  const existing = await prisma.property.findUnique({ where: { mlsId: listing.ListingKey } })

  if (existing) {
    // Never touch source/showOnPortal/featured on update — those are
    // admin curation state, not MLS data.
    await prisma.property.update({ where: { id: existing.id }, data })
    return 'updated' as const
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
  return 'created' as const
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = { created: 0, updated: 0, skippedOutOfArea: 0, pagesProcessed: 0 }
  let latestModificationTimestamp: string | undefined

  try {
    const state = await prisma.mlsSyncState.findUnique({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
    })
    const modifiedSince = state?.lastModificationTimestamp.toISOString() ?? '2020-01-01T00:00:00.00Z'

    let page = await fetchProperties({
      modifiedSince,
      status: 'Active',
      top: 100,
      expand: ['Media'],
    })

    for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_RUN; pageIndex++) {
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

    await prisma.mlsSyncState.upsert({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
      create: {
        originatingSystemName: ORIGINATING_SYSTEM,
        lastModificationTimestamp: latestModificationTimestamp ? new Date(latestModificationTimestamp) : new Date(modifiedSince),
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
          metadata: stats,
        },
      })
    }

    return NextResponse.json({ ok: true, ...stats })
  } catch (err) {
    console.error('[GET /api/cron/mls-sync]', err)
    await prisma.mlsSyncState.upsert({
      where: { originatingSystemName: ORIGINATING_SYSTEM },
      create: {
        originatingSystemName: ORIGINATING_SYSTEM,
        lastModificationTimestamp: new Date('2020-01-01T00:00:00.00Z'),
        lastRunStatus: 'error',
        lastRunError: err instanceof Error ? err.message : String(err),
      },
      update: {
        lastRunAt: new Date(),
        lastRunStatus: 'error',
        lastRunError: err instanceof Error ? err.message : String(err),
      },
    })
    return NextResponse.json({ ok: false, ...stats }, { status: 500 })
  }
}
