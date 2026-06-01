import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth } from '@/lib/supabase/server'

const CreateActivitySchema = z.object({
  type: z.enum(['call', 'email', 'showing', 'offer', 'note']),
  notes: z.string().nullish(),
  activity_date: z.string().datetime().optional(),
})

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('lead_activities')
      .select(`*, user:users!user_id(id, name)`)
      .eq('lead_id', params.id)
      .order('activity_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[ACTIVITIES/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await requireAuth()
    const supabase = createClient()
    const body = await req.json()
    const parsed = CreateActivitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: params.id,
        user_id: currentUser.id,
        ...parsed.data,
        activity_date: parsed.data.activity_date ?? new Date().toISOString(),
      })
      .select(`*, user:users!user_id(id, name)`)
      .single()

    if (error) throw error

    // Update last_contact_at on the lead
    await supabase
      .from('leads')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[ACTIVITIES/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
