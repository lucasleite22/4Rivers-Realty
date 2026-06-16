import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exportPropertiesToBuffer } from '@/lib/excel'
import { requireAuth, AuthError } from '@/lib/auth'
import type { PropertyStatus, PropertyType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as PropertyStatus | null
  const type   = searchParams.get('type')   as PropertyType   | null

  const properties = await prisma.property.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type   ? { type }   : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const buffer = await exportPropertiesToBuffer(properties)
  const filename = `4rivers-properties-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
