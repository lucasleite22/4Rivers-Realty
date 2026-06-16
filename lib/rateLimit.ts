// In-memory sliding-window rate limiter.
// Works for single-instance deployments (Hostinger VPS). For multi-instance
// deployments, replace the Map with a Redis store (e.g. Upstash).

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

// Periodically purge expired entries so the Map doesn't grow unbounded.
// Runs at most once per minute in Node.js; skipped during build.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((w, key) => {
      if (w.resetAt < now) store.delete(key)
    })
  }, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment the rate limit for a given identifier.
 * @param key      Unique identifier — typically `${ip}:${route}`
 * @param max      Max requests allowed per window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    const entry: Window = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { allowed: true, remaining: max - 1, resetAt: entry.resetAt }
  }

  existing.count++
  const remaining = Math.max(0, max - existing.count)
  return {
    allowed: existing.count <= max,
    remaining,
    resetAt: existing.resetAt,
  }
}

/** Extract the real IP from a Next.js request. */
export function getIp(req: { headers: { get: (k: string) => string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
