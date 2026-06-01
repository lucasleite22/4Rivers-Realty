import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAuth } from '@/lib/supabase/server'

const MoveStageSchema = z.object({
  status: z.enum([
    'new_lead', 'contacted', 'showing', 'offer_made',
    'under_contract', 'closed_won', 'closed_lost',
  ]),
})

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const supabase = createClient()
    const body = await req.json()
    const parsed = MoveStageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status value', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status: parsed.data.status })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[LEAD/STAGE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
