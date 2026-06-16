import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exportLeadsToBuffer } from '@/lib/excel'
import { requireAuth, AuthError } from '@/lib/auth'
import type { LeadStatus, LeadOrigin } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const { searchParams } = new URL(req.url)

  const from    = searchParams.get('from')   ? new Date(searchParams.get('from')!)   : undefined
  const to      = searchParams.get('to')     ? new Date(searchParams.get('to')!)     : undefined
  const status  = searchParams.get('status') as LeadStatus | null
  const origin  = searchParams.get('origin') as LeadOrigin | null

  const leads = await prisma.lead.findMany({
    where: {
      ...(from || to ? { createdAt: { gte: from, lte: to } } : {}),
      ...(status ? { status } : {}),
      ...(origin ? { origin } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const buffer = await exportLeadsToBuffer(leads, {
    from,
    to,
    status: status ?? undefined,
    origin: origin ?? undefined,
  })

  const filename = `4rivers-leads-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
