// lib/auth.ts — JWT helpers using jose

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import prisma from './prisma'

const rawSecret = process.env.JWT_SECRET ?? 'change-me-in-production'
// Validation moved to runtime (signToken/verifyToken) so it doesn't block the build phase
const JWT_SECRET = new TextEncoder().encode(rawSecret)

function assertSecret() {
  if (process.env.NODE_ENV === 'production' && rawSecret === 'change-me-in-production') {
    throw new Error('JWT_SECRET env var must be set in production')
  }
}
const COOKIE_NAME = '4rivers_session'
const TOKEN_TTL = '7d'

export interface TokenPayload {
  sub: string        // user id
  email: string
  name: string
  role: string
}

// ── Sign ──────────────────────────────────────

export async function signToken(user: {
  id: string
  email: string
  name: string
  role: string
}): Promise<string> {
  assertSecret()
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(JWT_SECRET)
}

// ── Verify (from request cookie) ─────────────

export async function verifyToken(
  req: NextRequest
): Promise<TokenPayload | null> {
  try {
    const token =
      req.cookies.get(COOKIE_NAME)?.value ??
      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      sub: payload.sub as string,
      email: payload['email'] as string,
      name: payload['name'] as string,
      role: payload['role'] as string,
    }
  } catch {
    return null
  }
}

// ── Middleware helpers ────────────────────────

export async function requireAuth(
  req: NextRequest
): Promise<TokenPayload> {
  const payload = await verifyToken(req)
  if (!payload) {
    throw new AuthError('Unauthorized', 401)
  }
  return payload
}

export async function requireAdmin(
  req: NextRequest
): Promise<TokenPayload> {
  const payload = await requireAuth(req)
  if (payload.role !== 'SUPER_ADMIN') {
    throw new AuthError('Forbidden — admin only', 403)
  }
  return payload
}

// ── Cookie helpers ────────────────────────────

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

// ── Custom error ──────────────────────────────

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
