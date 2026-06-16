// app/api/properties/featured/route.ts

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ── GET /api/properties/featured — top 6 ─────

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { featured: true, showOnPortal: true, status: 'ACTIVE' },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
    return NextResponse.json(properties)
  } catch {
    return NextResponse.json([])
  }
}
