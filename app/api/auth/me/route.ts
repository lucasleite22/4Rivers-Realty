import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ data: user })
  } catch (err) {
    console.error('[AUTH/ME]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
