import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, requireAdmin } from '@/lib/supabase/server'

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['super_admin', 'agent']).optional(),
  active: z.boolean().optional(),
})

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
    const supabase = createClient()
    const body = await req.json()
    const parsed = UpdateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .update(parsed.data)
      .eq('id', params.id)
      .select('id, email, name, role, active, created_at')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[USER/PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
