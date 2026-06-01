import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth } from '@/lib/supabase/server'

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  type: z.enum(['buyer', 'seller', 'investor']).default('buyer'),
  origin: z
    .enum(['Website', 'Referral', 'Zillow', 'Realtor.com', 'Instagram', 'Other'])
    .default('Website'),
  property_interest: z.string().nullish(),
  budget_usd: z.number().positive().nullish(),
  acreage_desired: z.number().positive().nullish(),
  county_preferred: z.string().nullish(),
  status: z
    .enum(['new_lead', 'contacted', 'showing', 'offer_made', 'under_contract', 'closed_won', 'closed_lost'])
    .default('new_lead'),
  featured: z.boolean().default(false),
  notes: z.string().nullish(),
  assigned_to: z.string().uuid().nullish(),
})

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const county = searchParams.get('county')
    const search = searchParams.get('search')
    const assignedTo = searchParams.get('assigned_to')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('leads')
      .select(
        `*, assigned_user:users!assigned_to(id, name, email)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (county) query = query.ilike('county_preferred', `%${county}%`)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      meta: { total: count ?? 0, page, limit },
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEADS/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const supabase = createClient()
    const body = await req.json()
    const parsed = CreateLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...parsed.data,
        assigned_to: parsed.data.assigned_to ?? currentUser.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEADS/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
