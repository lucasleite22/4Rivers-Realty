import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth, requireAdmin } from '@/lib/supabase/server'

const UpdateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  type: z.enum(['buyer', 'seller', 'investor']).optional(),
  origin: z
    .enum(['Website', 'Referral', 'Zillow', 'Realtor.com', 'Instagram', 'Other'])
    .optional(),
  property_interest: z.string().nullish(),
  budget_usd: z.number().positive().nullish(),
  acreage_desired: z.number().positive().nullish(),
  county_preferred: z.string().nullish(),
  status: z
    .enum(['new_lead', 'contacted', 'showing', 'offer_made', 'under_contract', 'closed_won', 'closed_lost'])
    .optional(),
  featured: z.boolean().optional(),
  notes: z.string().nullish(),
  assigned_to: z.string().uuid().nullish(),
  last_contact_at: z.string().datetime().nullish(),
})

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('leads')
      .select(`*, assigned_user:users!assigned_to(id, name, email)`)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEAD/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const supabase = createClient()
    const body = await req.json()
    const parsed = UpdateLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('leads')
      .update(parsed.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Lead not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEAD/PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const supabase = createClient()

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ data: { message: 'Lead deleted' } })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEAD/DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
