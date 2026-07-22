export const dynamic = 'force-dynamic'

// app/api/dashboard/stats/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalActiveProperties,
      leadsThisMonth,
      showingsThisMonth,
      offersThisMonth,
      closedThisMonth,
      overdueFollowUps,
      recentEvents,
    ] = await Promise.all([
      prisma.property.count({ where: { status: 'ACTIVE' } }),

      prisma.lead.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      prisma.dashboardEvent.count({
        where: { type: 'SHOWING_SCHEDULED', createdAt: { gte: startOfMonth } },
      }),

      prisma.dashboardEvent.count({
        where: { type: 'OFFER_MADE', createdAt: { gte: startOfMonth } },
      }),

      prisma.dashboardEvent.count({
        where: { type: 'DEAL_CLOSED', createdAt: { gte: startOfMonth } },
      }),

      prisma.lead.count({
        where: {
          status: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
          OR: [
            { lastContactAt: { lt: sevenDaysAgo } },
            { lastContactAt: null },
          ],
        },
      }),

      prisma.dashboardEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const userIds = Array.from(new Set(recentEvents.map((e) => e.userId).filter((id): id is string => Boolean(id))))
    const users = userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const userMap = new Map(users.map((u) => [u.id, u.name]))

    const recentEventsWithUser = recentEvents.map((event) => ({
      ...event,
      userName: event.userId ? userMap.get(event.userId) ?? null : null,
    }))

    return NextResponse.json({
      totalActiveProperties,
      leadsThisMonth,
      showingsThisMonth,
      offersThisMonth,
      closedThisMonth,
      overdueFollowUps,
      recentEvents: recentEventsWithUser,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[GET /api/dashboard/stats]', err)
    // Return zeros so the dashboard renders in demo/no-DB environments
    return NextResponse.json({
      totalActiveProperties: 0, leadsThisMonth: 0, showingsThisMonth: 0,
      offersThisMonth: 0, closedThisMonth: 0, overdueFollowUps: 0, recentEvents: [],
    })
  }
}
