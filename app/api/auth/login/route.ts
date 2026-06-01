import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Fetch CRM profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, role, active')
      .eq('id', data.user.id)
      .single()

    if (!profile?.active) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      data: {
        user: profile,
        session: {
          access_token: data.session?.access_token,
          expires_at: data.session?.expires_at,
        },
      },
    })
  } catch (err) {
    console.error('[AUTH/LOGIN]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
