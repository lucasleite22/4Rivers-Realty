import { rateLimit, getIp } from '@/lib/rateLimit'

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const result = rateLimit('test-key-1', 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks after exceeding the limit', () => {
    const key = 'test-key-block'
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000)
    const result = rateLimit(key, 3, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after the window expires', () => {
    const key = 'test-key-reset'
    // Fill the window
    for (let i = 0; i < 2; i++) rateLimit(key, 2, 1)
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(key, 2, 1)
        expect(result.allowed).toBe(true)
        resolve()
      }, 10)
    })
  })

  it('tracks separate keys independently', () => {
    rateLimit('key-a', 1, 60_000)
    rateLimit('key-a', 1, 60_000) // exhausted

    const result = rateLimit('key-b', 1, 60_000)
    expect(result.allowed).toBe(true)
  })
})

describe('getIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = { headers: { get: (k: string) => k === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null } }
    expect(getIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const req = {
      headers: {
        get: (k: string) => k === 'x-real-ip' ? '9.9.9.9' : null,
      },
    }
    expect(getIp(req)).toBe('9.9.9.9')
  })

  it('returns unknown when no headers present', () => {
    const req = { headers: { get: () => null } }
    expect(getIp(req)).toBe('unknown')
  })
})
