import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { buildDashboardProperties } from '@/lib/realrisk-dashboard'

// Feeds the RealRisk dashboard at /admin/realrisk. MLS data for logged-in
// users only (VOW-style use) — never public, never cached by a CDN.
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const limit = Math.min(Math.max(Number(new URL(req.url).searchParams.get('limit')) || 300, 1), 1000)
  const properties = await buildDashboardProperties(limit)

  return NextResponse.json(
    { properties, generatedAt: new Date().toISOString(), source: 'Stellar MLS via MLS Grid' },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
