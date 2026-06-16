/**
 * Tests for POST /api/contact
 * Mocks Prisma and Resend so no real DB/network calls are made.
 */

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    lead: {
      create: jest.fn().mockResolvedValue({
        id: 'lead-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        type: 'BUYER',
        origin: 'WEBSITE',
        propertyInterest: null,
        status: 'NEW_LEAD',
        notes: null,
      }),
    },
    dashboardEvent: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}))

// Mock resend
jest.mock('@/lib/resend', () => ({
  resend: { emails: { send: jest.fn().mockResolvedValue({ id: 'email-id' }) } },
  FROM_ADDRESS: 'notifications@4riversrealty.com',
  AGENT_EMAIL: 'info@4riversrealty.com',
}))

import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

function makeRequest(body: object, ip = '127.0.0.1'): NextRequest {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/name/i)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ name: 'John', email: 'not-an-email' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/email/i)
  })

  it('creates a lead and returns 201 for valid input', async () => {
    const res = await POST(makeRequest({ name: 'John Doe', email: 'john@example.com' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.id).toBe('lead-123')
    expect(prisma.lead.create).toHaveBeenCalledTimes(1)
  })

  it('accepts submission without email', async () => {
    const res = await POST(makeRequest({ name: 'No Email User' }))
    expect(res.status).toBe(201)
  })

  it('returns 429 after exceeding rate limit', async () => {
    const ip = '10.0.0.1'
    // Exhaust the limit (10 per 15 min)
    for (let i = 0; i < 10; i++) {
      await POST(makeRequest({ name: `User ${i}` }, ip))
    }
    const res = await POST(makeRequest({ name: 'Eleventh' }, ip))
    expect(res.status).toBe(429)
  })
})
