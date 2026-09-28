/**
 * MLSGrid API wrapper for 4Rivers Realty
 *
 * Auth:  Bearer token — set MLSGRID_API_TOKEN in .env.local
 * Docs:  https://docs.mlsgrid.com/mlsgrid-api-documentation
 * MLS:   mfrmls (My Florida Regional MLS / Stellar MLS) — this token's subscription
 *        only has access to OriginatingSystemName eq 'mfrmls'. Any other value
 *        (e.g. 'actris') returns 403.
 *
 * Replaces services/simplyrets.service.ts, which was blocked waiting on the
 * client (Jales) to request IDX/VOW access from Stellar MLS. This token already
 * works against mfrmls, so it unblocks Módulo 06 without that dependency.
 *
 * IMPORTANT — MLSGrid is a *replication* API, not a search API:
 *   - Server-side $filter is restricted to: MlgCanView, ModificationTimestamp,
 *     OriginatingSystemName, StandardStatus, ListingId, PropertyType, ListOfficeMlsId.
 *     Fields like CountyOrParish, City, ListPrice, BedroomsTotal CANNOT be filtered
 *     via the API — confirmed empirically (400 "Invalid filter field").
 *   - The expected pattern is: pull the full delta (filtered by ModificationTimestamp)
 *     on a schedule, upsert into our own Postgres via Prisma, then do all
 *     county/city/price/type filtering against our own DB — never per-request
 *     against MLSGrid. See fetchFourRiversListings() below for why it only
 *     pre-filters client-side and is NOT meant for production traffic.
 *   - Always filter MlgCanView eq true — MLSGrid's own flag for "cleared to
 *     display", equivalent to Stellar's InternetEntireListingDisplayYN.
 *   - Must always request gzip. Node's built-in fetch (undici) does this
 *     automatically and decompresses transparently — do not try to set
 *     Accept-Encoding manually, it's a forbidden header and will be dropped
 *     silently by fetch, which makes the API respond 400 "COMPRESSION REQUIRED".
 *
 * Key endpoints used by 4Rivers:
 *   GET /Property                — replication feed (delta sync, paginated via @odata.nextLink)
 *   GET /Property('ListingKey')  — single listing detail
 */

const BASE_URL = 'https://api.mlsgrid.com/v2'
const ORIGINATING_SYSTEM = 'mfrmls'

// ── Auth ──────────────────────────────────────────────────────

function getHeaders(): HeadersInit {
  const token = process.env.MLSGRID_API_TOKEN
  if (!token) throw new Error('MLSGRID_API_TOKEN not configured')
  return {
    Authorization: `Bearer ${token}`,
  }
}

// ── RESO Property fields actually used by 4Rivers ─────────────
//
// MLSGrid/RESO returns 190+ fields per listing (including MFR_* Stellar
// custom fields). This interface only types what we map into our schema —
// extend as needed, the raw response has everything else too.

export interface MlsMedia {
  MediaKey: string
  MediaURL: string
  MediaType: string
  Order: number
  ImageWidth?: number
  ImageHeight?: number
  LongDescription?: string
  Permission?: string[]
}

export interface MlsRoom {
  RoomKey: string
  RoomType: string
  RoomLength?: number
  RoomWidth?: number
  RoomDimensions?: string
  RoomFeatures?: string[]
}

export interface MlsListing {
  '@odata.id'?: string
  ListingKey: string
  ListingId: string
  OriginatingSystemName: string
  ModificationTimestamp: string
  StandardStatus: string // 'Active' | 'Closed' | 'Pending' | ...
  MlsStatus?: string
  MlgCanView: boolean
  // Which MLS Grid Master Data License Agreement use cases this record is
  // authorized for (e.g. ['IDX'], ['VOW'], ['IDX', 'VOW']). MlgCanView only
  // says "keep this record" — public IDX display additionally requires
  // 'IDX' to be present here. A record with MlgCanView: true but MlgCanUse
  // not containing 'IDX' may be retained (e.g. for VOW/CRM use) but must
  // NOT be shown on a public-facing site.
  MlgCanUse?: string[]

  ListPrice?: number
  ClosePrice?: number
  OriginalListPrice?: number
  ListingContractDate?: string
  CloseDate?: string

  UnparsedAddress?: string
  StreetNumber?: string
  StreetName?: string
  StreetSuffix?: string
  UnitNumber?: string
  City: string
  StateOrProvince: string
  PostalCode?: string
  CountyOrParish?: string
  Latitude?: number
  Longitude?: number

  PropertyType: string // 'Residential' | 'Land' | 'Commercial' | 'Farm' | ...
  PropertySubType?: string
  BedroomsTotal?: number
  BathroomsFull?: number
  BathroomsHalf?: number
  BathroomsTotalInteger?: number
  LivingArea?: number
  LotSizeAcres?: number
  LotSizeSquareFeet?: number
  YearBuilt?: number
  GarageSpaces?: number
  PoolPrivateYN?: boolean
  StoriesTotal?: number

  // Equestrian / rural (RESO standard fields — presence depends on subtype)
  HorseYN?: boolean
  HorseAmenities?: string[]

  Zoning?: string
  WaterfrontYN?: boolean
  WaterBodyName?: string
  View?: string[]

  PublicRemarks?: string
  VirtualTourURLUnbranded?: string

  ListAgentFullName?: string
  ListAgentKey?: string
  ListAgentDirectPhone?: string
  ListAgentEmail?: string
  ListOfficeName?: string
  ListOfficeKey?: string
  ListOfficePhone?: string

  TaxAnnualAmount?: number
  TaxYear?: number
  ParcelNumber?: string

  Media?: MlsMedia[]
  Rooms?: MlsRoom[]
  UnitTypes?: unknown[]
}

interface MlsGridResponse {
  '@odata.context': string
  '@odata.nextLink'?: string
  value: MlsListing[]
}

// ── MLS field → 4Rivers Prisma schema mapping ────────────────
//
// Use this as the source of truth when writing the sync Edge Function (Semana 8).
// RESO/MLSGrid field (left)    →  Prisma Property field (right)
//
// ListingKey                  →  mlsId           (store to detect updates)
// ListPrice                   →  priceUsd
// Latitude                    →  latitude
// Longitude                   →  longitude
// UnparsedAddress             →  address
// City                        →  city
// CountyOrParish              →  county
// LotSizeAcres                →  acreage
// PropertyType / SubType      →  type  (mapped via MLS_TYPE_MAP below)
// BedroomsTotal                →  bedrooms
// BathroomsTotalInteger        →  bathrooms
// LivingArea                  →  sqft
// Media[].MediaURL             →  coverImageUrl (store in property_images table)
// PublicRemarks                →  description
// ListAgentFullName            →  (link to User if agent exists)
// ModificationTimestamp        →  updatedAt (use as the delta-sync cursor)

export const MLS_TYPE_MAP: Record<string, string> = {
  Farm: 'HORSE_FARM', // refine with PropertySubType/HorseYN
  Ranch: 'RANCH',
  Residential: 'RESIDENTIAL',
  'Single Family Residence': 'RESIDENTIAL',
  Land: 'LAND',
  Commercial: 'COMMERCIAL',
  'Commercial Sale': 'COMMERCIAL',
}

// ── Query parameters for GET /Property ─────────────────────────
//
// Only server-filterable fields are exposed here — this is a hard MLSGrid
// replication constraint, confirmed via a live 400 response:
// "Replication requests to the Property resource can only be filtered using
//  MlgCanView, ModificationTimestamp, OriginatingSystemName, StandardStatus,
//  ListingId, PropertyType, ListOfficeMlsId."

export interface MlsPropertyParams {
  modifiedSince?: string // ISO timestamp — required for incremental sync
  status?: 'Active' | 'Closed' | 'Pending' | 'Active Under Contract'
  propertyType?: 'Residential' | 'Land' | 'Commercial' | 'Farm'
  top?: number // page size, MLSGrid recommends <= 100
  expand?: Array<'Media' | 'Rooms' | 'UnitTypes'>
}

function buildFilter(params: MlsPropertyParams): string {
  const clauses = [
    `OriginatingSystemName eq '${ORIGINATING_SYSTEM}'`,
    'MlgCanView eq true',
    `ModificationTimestamp gt ${params.modifiedSince ?? '2020-01-01T00:00:00.00Z'}`,
  ]
  if (params.status) clauses.push(`StandardStatus eq '${params.status}'`)
  if (params.propertyType) clauses.push(`PropertyType eq '${params.propertyType}'`)
  return clauses.join(' and ')
}

// ── GET /Property — one page of the replication feed ──────────

export async function fetchProperties(
  params: MlsPropertyParams = {}
): Promise<{ listings: MlsListing[]; nextLink?: string }> {
  const qs = new URLSearchParams()
  qs.set('$filter', buildFilter(params))
  if (params.expand?.length) qs.set('$expand', params.expand.join(','))
  qs.set('$top', String(params.top ?? 100))

  const res = await fetch(`${BASE_URL}/Property?${qs.toString()}`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MLSGrid error: ${res.status} ${res.statusText} — ${body}`)
  }
  const data: MlsGridResponse = await res.json()
  return { listings: data.value, nextLink: data['@odata.nextLink'] }
}

// ── Follow @odata.nextLink to get the next page of a replication run ──
//
// MLSGrid pagination is cursor-based via nextLink, not $skip. Use this in
// the sync job to walk the full delta rather than paging with an offset.

export async function fetchNextPage(
  nextLink: string
): Promise<{ listings: MlsListing[]; nextLink?: string }> {
  const res = await fetch(nextLink, { headers: getHeaders() })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MLSGrid error: ${res.status} ${res.statusText} — ${body}`)
  }
  const data: MlsGridResponse = await res.json()
  return { listings: data.value, nextLink: data['@odata.nextLink'] }
}

// ── Fetch every page of a delta sync (all Active + recently modified) ──
//
// This is the shape the Semana 8 Edge Function should follow: walk every
// page via nextLink and upsert each batch into Postgres as it arrives,
// rather than accumulating everything in memory. Kept simple here since
// this file is meant as the integration starting point, not the final sync job.

export async function fetchAllProperties(
  params: MlsPropertyParams = {}
): Promise<MlsListing[]> {
  const all: MlsListing[] = []
  let page = await fetchProperties(params)
  all.push(...page.listings)
  while (page.nextLink) {
    page = await fetchNextPage(page.nextLink)
    all.push(...page.listings)
  }
  return all
}

// ── GET /Property('ListingKey') — single listing detail ───────

export async function fetchPropertyByKey(
  listingKey: string,
  expand: Array<'Media' | 'Rooms' | 'UnitTypes'> = ['Media', 'Rooms']
): Promise<MlsListing> {
  const qs = new URLSearchParams()
  if (expand.length) qs.set('$expand', expand.join(','))

  const res = await fetch(`${BASE_URL}/Property('${listingKey}')?${qs.toString()}`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MLSGrid error: ${res.status} ${res.statusText} — ${body}`)
  }
  return res.json()
}

// ── Convenience: fetch 4Rivers target listings (Marion + Sumter) ──
//
// NOTE: county/city CANNOT be filtered server-side by MLSGrid (see module
// doc above), so this pulls a page of Active listings and filters it
// in-memory. That's fine for ad-hoc testing but NOT how production should
// work — the real sync must replicate the full mfrmls delta into Postgres
// and let the app query/filter Marion+Sumter from our own DB.

const FOUR_RIVERS_COUNTIES = ['Marion', 'Sumter']

export async function fetchFourRiversListings(
  overrides: Partial<MlsPropertyParams> = {}
): Promise<MlsListing[]> {
  const { listings } = await fetchProperties({
    status: 'Active',
    top: 100,
    expand: ['Media', 'Rooms'],
    ...overrides,
  })
  return listings.filter(
    (l) => l.CountyOrParish && FOUR_RIVERS_COUNTIES.includes(l.CountyOrParish)
  )
}

// ── Convenience: fetch only horse farms + ranches (Marion + Sumter) ────

export async function fetchEquestrianListings(): Promise<MlsListing[]> {
  const listings = await fetchFourRiversListings({ propertyType: 'Farm', top: 100 })
  return listings
}
