// app/api/properties/[id]/images/reorder/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'

// ── PATCH — reorder images ────────────────────
// Body: { order: [{ id: string, sortOrder: number, isCover?: boolean }] }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)

    const { order } = await req.json() as {
      order: { id: string; sortOrder: number; isCover?: boolean }[]
    }

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'order array required' }, { status: 400 })
    }

    await prisma.$transaction(
      order.map((item) =>
        prisma.propertyImage.update({
          where: { id: item.id },
          data: {
            sortOrder: item.sortOrder,
            ...(item.isCover !== undefined ? { isCover: item.isCover } : {}),
          },
        })
      )
    )

    const images = await prisma.propertyImage.findMany({
      where: { propertyId: params.id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(images)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[PATCH /api/properties/[id]/images/reorder]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
