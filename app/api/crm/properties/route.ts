import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth, requireAdmin } from '@/lib/supabase/server'

const CreatePropertySchema = z.object({
  title: z.string().min(1),
  type: z.enum(['horse_farm', 'ranch', 'residential', 'commercial', 'land']).default('land'),
  price_usd: z.number().positive().nullish(),
  acreage: z.number().positive().nullish(),
  county: z.string().nullish(),
  city: z.string().nullish(),
  address: z.string().nullish(),
  description: z.string().nullish(),
  status: z.enum(['active', 'sold', 'under_contract']).default('active'),
  featured: z.boolean().default(false),
  stables: z.number().int().min(0).default(0),
  arenas: z.number().int().min(0).default(0),
  pastures: z.number().int().min(0).default(0),
})

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const county = searchParams.get('county')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const minAcreage = searchParams.get('min_acreage')
    const featured = searchParams.get('featured')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('properties')
      .select(`*, images:property_images(id, url, is_cover, sort_order)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (county) query = query.ilike('county', `%${county}%`)
    if (minPrice) query = query.gte('price_usd', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price_usd', parseFloat(maxPrice))
    if (minAcreage) query = query.gte('acreage', parseFloat(minAcreage))
    if (featured === 'true') query = query.eq('featured', true)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      meta: { total: count ?? 0, page, limit },
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[PROPERTIES/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createClient()
    const body = await req.json()
    const parsed = CreatePropertySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[PROPERTIES/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
