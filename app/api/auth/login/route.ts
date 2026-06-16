// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // 5 attempts per IP per 15 minutes — brute-force protection
  const { allowed, resetAt } = rateLimit(`login:${getIp(req)}`, 5, 15 * 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts — please wait a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })

    setAuthCookie(response, token)

    return response
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
