import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    return NextResponse.json({ data: { message: 'Logged out successfully' } })
  } catch (err) {
    console.error('[AUTH/LOGOUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
