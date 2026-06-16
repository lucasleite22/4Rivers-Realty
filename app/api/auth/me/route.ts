export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

export async function GET(req: NextRequest) {
  const payload = await verifyToken(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (DEMO_MODE) {
    return NextResponse.json({ id: payload.sub, email: payload.email, name: payload.name, role: payload.role, active: true })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, active: true },
    })
    if (!user || !user.active) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ id: payload.sub, email: payload.email, name: payload.name, role: payload.role, active: true })
  }
}
