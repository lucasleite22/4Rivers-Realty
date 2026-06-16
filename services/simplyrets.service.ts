/**
 * SimplyRETS API wrapper for 4Rivers Realty
 *
 * Auth:  HTTP Basic — set SIMPLYRETS_USER + SIMPLYRETS_PASS in .env
 * Docs:  https://docs.simplyrets.com/api/index.html
 * MLS:   Stellar MLS (Florida) — market area covers Marion & Sumter counties
 *
 * Rate limits (production credentials):
 *   - 20 req/s, 5 000 req/day on Starter plan
 *   - Use Next.js `next: { revalidate }` to cache aggressively
 *
 * Key endpoints used by 4Rivers:
 *   GET /listings          — search / paginate active listings
 *   GET /listings/:id      — single listing detail
 *   GET /listings/count    — total count for pagination metadata
 *   GET /openhouses        — open house schedule (future use)
 */

const BASE_URL = 'https://api.simplyrets.com'

// ── Auth ──────────────────────────────────────────────────────

function getHeaders(): HeadersInit {
  const user = process.env.SIMPLYRETS_USER
  const pass = process.env.SIMPLYRETS_PASS
  if (!user || !pass) throw new Error('SimplyRETS credentials not configured')
  return {
    Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
    'Content-Type': 'application/json',
  }
}

// ── Full MLS listing type (Stellar MLS fields) ────────────────

export interface MlsListing {
  mlsId: string
  listPrice: number
  closePrice?: number
  listDate: string
  closeDate?: string
  modificationTimestamp: string

  address: {
    full: string
    city: string
    state: string
    postalCode: string
    county: string
    streetNumber: string
    streetName: string
    unit?: string
  }

  geo?: {
    lat: number
    lng: number
    accuracy?: number
  }

  property: {
    // Core
    type: string          // 'Farm', 'Residential', 'Land', 'Commercial'
    subType: string       // 'Single Family', 'Horse Farm', 'Ranch', etc.
    style?: string
    status: string        // 'Active', 'Active Under Contract', 'Closed'
    area?: number         // lot size sq ft
    lotSizeAcres?: number
    acres?: number        // same as lotSizeAcres — API can return either
    sqft?: number

    // Residential
    bedrooms?: number
    bathsFull?: number
    bathsHalf?: number
    garageSpaces?: number
    yearBuilt?: number
    pool?: boolean
    stories?: number

    // Horse farm / equestrian (Stellar MLS custom fields)
    horseFacilities?: boolean
    numberOfBarns?: number
    numberOfStalls?: number
    numberOfPasturesEnclosed?: number
    arenaType?: string    // 'Covered', 'Open', 'None'
    irrigationWater?: string
    fencing?: string[]   // ['Board', 'Wire', 'Vinyl', ...]

    // Land / rural
    zoning?: string
    topography?: string
    waterFrontage?: boolean
    waterBody?: string
    waterAccess?: boolean
    flood?: string        // FEMA flood zone
    currentUse?: string[]
    possibleUse?: string[]
    road?: string[]
    utilities?: string[]
  }

  photos: string[]
  virtualTourUrl?: string
  publicRemarks: string
  privateRemarks?: string

  agent: {
    firstName: string
    lastName: string
    phone?: string
    email?: string
    id: string
  }

  office: {
    name: string
    phone?: string
    brokerid?: string
  }

  tax?: {
    taxAnnualAmount?: number
    taxYear?: number
    parcelNumber?: string
  }

  // MLS compliance — must display per Stellar MLS rules
  disclaimer?: string
  mls?: {
    status: string
    area?: string
    daysOnMarket?: number
    originalListPrice?: number
  }
}

// ── Query parameters for GET /listings ───────────────────────
//
// Stellar MLS — 4Rivers relevant parameters only.
// Full list: https://docs.simplyrets.com/api/index.html#listings-GET

export interface MlsListingsParams {
  // Pagination
  limit?: number        // max 500 per request (default 10)
  offset?: number
  lastId?: string       // cursor-based pagination (preferred for large syncs)

  // Status
  status?: 'Active' | 'Closed' | 'Active Under Contract'

  // Price
  minprice?: number
  maxprice?: number

  // Location — use these to scope to Marion & Sumter counties
  counties?: string[]   // e.g. ['Marion', 'Sumter']
  cities?: string[]     // e.g. ['Ocala', 'Summerfield', 'Wildwood']
  postalCodes?: string[]

  // Type — SimplyRETS type codes for Stellar MLS
  // For horse farms use type='Farm' or q='horse' with subtype filter
  type?: string         // 'Residential' | 'Farm' | 'Land' | 'Commercial'
  subtype?: string      // freeform: 'Horse Farm', 'Ranch', 'Agricultural'
  q?: string            // full-text search across all fields

  // Size
  minacres?: number
  maxacres?: number
  minbeds?: number
  maxbeds?: number
  minbaths?: number

  // Sort
  sort?: 'listprice' | 'listdate' | 'beds' | 'baths' | 'sqft' | 'dom'
  sortorder?: 'asc' | 'desc'

  // Featured / special
  features?: string[]   // search inside property features array
}

// ── MLS field → 4Rivers Prisma schema mapping ────────────────
//
// Use this as the source of truth when writing the sync Edge Function (Semana 8).
// MLS field (left)  →  Prisma Property field (right)
//
// mlsId               mlsId           (store to detect updates)
// listPrice           priceUsd
// geo.lat             latitude
// geo.lng             longitude
// address.full        address
// address.city        city
// address.county      county
// property.acres      acreage
// property.type       type  (mapped via TYPE_MAP below)
// property.subType    (inform type mapping)
// property.bedrooms   bedrooms (not in schema yet — add if needed)
// property.bathsFull  bathrooms (not in schema yet)
// property.sqft       sqft (not in schema yet)
// property.numberOfStalls   stables
// property.numberOfBarns    (no equivalent yet)
// property.numberOfPasturesEnclosed  pastures
// photos[0]           coverImageUrl (store in property_images table)
// publicRemarks       description
// agent.firstName + lastName  (link to User if agent exists)
// modificationTimestamp  updatedAt (use for delta sync)

export const MLS_TYPE_MAP: Record<string, string> = {
  Farm: 'HORSE_FARM',        // refine with subType/features
  'Horse Farm': 'HORSE_FARM',
  Ranch: 'RANCH',
  Residential: 'RESIDENTIAL',
  'Single Family': 'RESIDENTIAL',
  Land: 'LAND',
  Commercial: 'COMMERCIAL',
}

// ── GET /listings ─────────────────────────────────────────────

export async function fetchListings(
  params: MlsListingsParams = {}
): Promise<MlsListing[]> {
  const qs = new URLSearchParams()

  const append = (key: string, val: string | number | undefined) => {
    if (val !== undefined && val !== '') qs.set(key, String(val))
  }

  append('limit', params.limit ?? 50)
  append('offset', params.offset)
  append('lastId', params.lastId)
  append('status', params.status ?? 'Active')
  append('minprice', params.minprice)
  append('maxprice', params.maxprice)
  append('type', params.type)
  append('subtype', params.subtype)
  append('q', params.q)
  append('minacres', params.minacres)
  append('maxacres', params.maxacres)
  append('minbeds', params.minbeds)
  append('maxbeds', params.maxbeds)
  append('minbaths', params.minbaths)
  append('sort', params.sort)
  append('sortorder', params.sortorder)

  if (params.counties?.length) {
    params.counties.forEach((c) => qs.append('counties', c))
  }
  if (params.cities?.length) {
    params.cities.forEach((c) => qs.append('cities', c))
  }
  if (params.postalCodes?.length) {
    params.postalCodes.forEach((z) => qs.append('postalCodes', z))
  }
  if (params.features?.length) {
    params.features.forEach((f) => qs.append('features', f))
  }

  const res = await fetch(`${BASE_URL}/listings?${qs.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`SimplyRETS error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ── GET /listings/count ───────────────────────────────────────
// Returns total count — use for pagination metadata before fetching page.

export async function fetchListingsCount(
  params: Omit<MlsListingsParams, 'limit' | 'offset' | 'lastId' | 'sort' | 'sortorder'> = {}
): Promise<number> {
  const qs = new URLSearchParams()
  if (params.counties?.length) params.counties.forEach((c) => qs.append('counties', c))
  if (params.cities?.length) params.cities.forEach((c) => qs.append('cities', c))
  if (params.type) qs.set('type', params.type)
  if (params.status) qs.set('status', params.status)
  if (params.minprice) qs.set('minprice', String(params.minprice))
  if (params.maxprice) qs.set('maxprice', String(params.maxprice))
  if (params.minacres) qs.set('minacres', String(params.minacres))
  if (params.q) qs.set('q', params.q)

  const res = await fetch(`${BASE_URL}/listings/count?${qs.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`SimplyRETS error: ${res.status} ${res.statusText}`)
  const data: { count: number } = await res.json()
  return data.count
}

// ── GET /listings/:id ─────────────────────────────────────────

export async function fetchListingById(mlsId: string): Promise<MlsListing> {
  const res = await fetch(`${BASE_URL}/listings/${mlsId}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`SimplyRETS error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ── Convenience: fetch all 4Rivers target listings ───────────
// Scoped to Marion + Sumter counties, active only.
// Use this as the base query for the sync Edge Function.

export async function fetchFourRiversListings(
  overrides: Partial<MlsListingsParams> = {}
): Promise<MlsListing[]> {
  return fetchListings({
    counties: ['Marion', 'Sumter'],
    status: 'Active',
    limit: 500,
    sort: 'listdate',
    sortorder: 'desc',
    ...overrides,
  })
}

// ── Convenience: fetch only horse farms + ranches ─────────────

export async function fetchEquestrianListings(): Promise<MlsListing[]> {
  return fetchListings({
    counties: ['Marion', 'Sumter'],
    status: 'Active',
    type: 'Farm',
    limit: 200,
    sort: 'listdate',
    sortorder: 'desc',
  })
}
