// TEMPORARY ENDPOINT — remove after use. Creates Saulo and Jales SUPER_ADMIN accounts.
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

const SETUP_SECRET = '841231d4c47bd4c265699c631aea66e20580121421b12fb2'

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-setup-key')
  if (key !== SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const users = [
      { email: 'saulo@4riversrealty.com', name: 'Saulo Castro', password: 'w7drgWqfQGMGm2jC' },
      { email: 'jales@4riversrealty.com', name: 'Jales Castro', password: 'd6aA5!tQxte2Hbdn' },
    ]

    const results = []
    for (const u of users) {
      const hashed = await hash(u.password, 12)
      const created = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          name: u.name,
          password: hashed,
          role: 'SUPER_ADMIN',
          active: true,
        },
      })
      results.push({ email: created.email, id: created.id })
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error('[POST /api/setup-temp-users]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
