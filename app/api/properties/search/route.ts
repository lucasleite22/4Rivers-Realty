// ============================================================
// GET /api/properties/search?q=horse+farm&page=1&limit=12
// Full-text search via Supabase tsvector.
// Public — no auth required.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PropertyListResponse, PropertyWithImages } from '@/types/properties'

const searchSchema = z.object({
  q:     z.string().min(1),
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  type:  z.enum(['horse_farm','ranch','residential','commercial','land']).optional(),
  status: z.enum(['active','sold','under_contract']).default('active'),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = searchSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { q, page, limit, type, status } = parsed.data
  const from = (page - 1) * limit
  const to   = from + limit - 1

  const supabase = createClient()

  let query = supabase
    .from('properties')
    .select('*, images:property_images(*)', { count: 'exact' })
    .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
    .eq('status', status)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const properties: PropertyWithImages[] = (data ?? []).map((row) => {
    const images = (row.images ?? []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    )
    const cover = images.find((i: any) => i.is_cover) ?? images[0] ?? null
    return { ...row, images, cover_image_url: cover?.url ?? null }
  })

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
