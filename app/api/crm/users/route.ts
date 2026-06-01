import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient, requireAdmin } from '@/lib/supabase/server'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['super_admin', 'agent']).default('agent'),
  password: z.string().min(8),
})

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, active, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[USERS/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = CreateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Use admin client to create auth user (bypasses email confirmation)
    const adminSupabase = createAdminClient()

    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Insert CRM profile
    const { data, error } = await adminSupabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
      })
      .select()
      .single()

    if (error) {
      // Rollback auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[USERS/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
