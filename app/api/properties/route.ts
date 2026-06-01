// ============================================================
// GET  /api/properties  — Public listing with filters + pagination
// POST /api/properties  — Create property (admin auth required)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildPublicPropertyQuery } from '@/lib/supabase/property-query'
import type { PropertyListResponse, PropertyWithImages } from '@/types/properties'

// ── Query param schema ────────────────────────────────────────

const filterSchema = z.object({
  search:      z.string().optional(),
  type:        z.enum(['horse_farm','ranch','residential','commercial','land']).optional(),
  status:      z.enum(['active','sold','under_contract']).optional(),
  featured:    z.coerce.boolean().optional(),
  price_min:   z.coerce.number().min(0).optional(),
  price_max:   z.coerce.number().min(0).optional(),
  acreage_min: z.coerce.number().min(0).optional(),
  acreage_max: z.coerce.number().min(0).optional(),
  county:      z.string().optional(),
  city:        z.string().optional(),
  sort_by:     z.enum(['price_usd','acreage','created_at','title']).optional(),
  sort_dir:    z.enum(['asc','desc']).optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(12),
})

// ── GET ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = filterSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const filter = parsed.data
  const supabase = createClient()

  const page  = filter.page
  const limit = filter.limit
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  let query = supabase
    .from('properties')
    .select('*, images:property_images(*)', { count: 'exact' })

  // Default to active-only for unauthenticated (public) requests
  if (!filter.status) {
    query = query.eq('status', 'active')
  } else {
    query = query.eq('status', filter.status)
  }

  if (filter.type)        query = query.eq('type', filter.type)
  if (filter.featured !== undefined) query = query.eq('featured', filter.featured)
  if (filter.county)      query = query.ilike('county', `%${filter.county}%`)
  if (filter.city)        query = query.ilike('city', `%${filter.city}%`)
  if (filter.price_min !== undefined) query = query.gte('price_usd', filter.price_min)
  if (filter.price_max !== undefined) query = query.lte('price_usd', filter.price_max)
  if (filter.acreage_min !== undefined) query = query.gte('acreage', filter.acreage_min)
  if (filter.acreage_max !== undefined) query = query.lte('acreage', filter.acreage_max)

  if (filter.search) {
    query = query.textSearch('search_vector', filter.search, {
      type: 'websearch',
      config: 'english',
    })
  }

  // Sort
  const sortBy  = filter.sort_by  ?? 'created_at'
  const sortDir = filter.sort_dir ?? 'desc'
  query = query.order(sortBy, { ascending: sortDir === 'asc' })

  // Pagination
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const properties = (data ?? []).map(normalizePropImages)
  const total = count ?? 0

  const response: PropertyListResponse = {
    data:        properties,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  }

  return NextResponse.json(response)
}

// ── POST ──────────────────────────────────────────────────────

const createSchema = z.object({
  title:       z.string().min(1),
  type:        z.enum(['horse_farm','ranch','residential','commercial','land']),
  price_usd:   z.number().positive().nullable().optional(),
  acreage:     z.number().positive().nullable().optional(),
  county:      z.string().nullable().optional(),
  city:        z.string().nullable().optional(),
  address:     z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status:      z.enum(['active','sold','under_contract']).default('active'),
  featured:    z.boolean().default(false),
  stables:     z.number().int().min(0).nullable().optional(),
  arenas:      z.number().int().min(0).nullable().optional(),
  pastures:    z.number().int().min(0).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

// ── Util ──────────────────────────────────────────────────────

function normalizePropImages(row: any): PropertyWithImages {
  const images = (row.images ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  )
  const cover = images.find((i: any) => i.is_cover) ?? images[0] ?? null
  return { ...row, images, cover_image_url: cover?.url ?? null }
}
