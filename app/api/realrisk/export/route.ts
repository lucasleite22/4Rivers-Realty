import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { buildRealriskWorkbook, loadRealriskListings } from '@/lib/realrisk-excel'

// MLS data for logged-in users only (VOW-style use) — never public.
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const { searchParams } = new URL(req.url)
  const days = Number(searchParams.get('days')) || 7
  const county = searchParams.get('county') ?? undefined

  const listings = await loadRealriskListings({ county })
  const buffer = await buildRealriskWorkbook(listings, { days, county })
  const filename = `realrisk-mls-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
