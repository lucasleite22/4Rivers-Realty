export const dynamic = 'force-dynamic'

// app/api/properties/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// ── GET /api/properties — public ─────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const where: Prisma.PropertyWhereInput = {}

    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const county = searchParams.get('county')
    const featured = searchParams.get('featured')
    const showOnPortal = searchParams.get('showOnPortal')
    const isLaunch = searchParams.get('isLaunch')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minAcreage = searchParams.get('minAcreage')
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)))

    if (type) where.type = type as any
    if (status) where.status = status as any
    if (county) where.county = { contains: county }
    if (featured === 'true') where.featured = true
    if (showOnPortal === 'true') where.showOnPortal = true
    if (isLaunch === 'true') where.isLaunch = true

    if (minPrice || maxPrice) {
      where.priceUsd = {}
      if (minPrice) where.priceUsd.gte = new Prisma.Decimal(minPrice)
      if (maxPrice) where.priceUsd.lte = new Prisma.Decimal(maxPrice)
    }

    if (minAcreage) {
      where.acreage = { gte: new Prisma.Decimal(minAcreage) }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { city: { contains: search } },
        { county: { contains: search } },
        { address: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      data: properties,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('[GET /api/properties]', err)
    return NextResponse.json({ data: [], meta: { total: 0, page: 1, limit: 20, pages: 0 } })
  }
}

// ── POST /api/properties — auth required ─────

export async function POST(req: NextRequest) {
  try {
    const token = await requireAuth(req)

    const body = await req.json()

    const property = await prisma.property.create({
      data: {
        title: body.title,
        type: body.type,
        priceUsd: new Prisma.Decimal(body.priceUsd),
        acreage: new Prisma.Decimal(body.acreage),
        county: body.county,
        city: body.city,
        address: body.address,
        description: body.description,
        status: body.status ?? 'ACTIVE',
        featured: body.featured ?? true,
        showOnPortal: body.showOnPortal ?? true,
        stables: body.stables ?? null,
        arenas: body.arenas ?? null,
        pastures: body.pastures ?? null,
        videoUrl: body.videoUrl ?? null,
        isLaunch: body.isLaunch ?? false,
        launchBadge: body.launchBadge ?? null,
        launchDate: body.launchDate ? new Date(body.launchDate) : null,
      },
      include: { images: true },
    })

    await prisma.dashboardEvent.create({
      data: {
        type: 'PROPERTY_CREATED',
        entityId: property.id,
        entityType: 'Property',
        userId: token.sub,
        metadata: { title: property.title },
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/properties]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
