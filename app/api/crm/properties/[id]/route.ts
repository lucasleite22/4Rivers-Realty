import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth, requireAdmin } from '@/lib/supabase/server'

const UpdatePropertySchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['horse_farm', 'ranch', 'residential', 'commercial', 'land']).optional(),
  price_usd: z.number().positive().nullish(),
  acreage: z.number().positive().nullish(),
  county: z.string().nullish(),
  city: z.string().nullish(),
  address: z.string().nullish(),
  description: z.string().nullish(),
  status: z.enum(['active', 'sold', 'under_contract']).optional(),
  featured: z.boolean().optional(),
  stables: z.number().int().min(0).optional(),
  arenas: z.number().int().min(0).optional(),
  pastures: z.number().int().min(0).optional(),
})

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(id, url, is_cover, sort_order)`)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[PROPERTY/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const supabase = createClient()
    const body = await req.json()
    const parsed = UpdatePropertySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('properties')
      .update(parsed.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[PROPERTY/PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const supabase = createClient()

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ data: { message: 'Property deleted' } })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[PROPERTY/DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
