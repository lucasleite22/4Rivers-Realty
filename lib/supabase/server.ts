import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client.
 * Use in Route Handlers and Server Components.
 * Uses the anon key + cookie-based session by default.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // set() can throw in Server Components — safe to ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // same
          }
        },
      },
    }
  )
}

/**
 * Admin Supabase client that bypasses RLS.
 * Use only in trusted server-side code (route handlers, migrations).
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export function createAdminClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {}
        },
      },
    }
  )
}

/**
 * Helper: get the current authenticated user and their CRM profile.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, role, active')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Helper: require authentication or throw a 401-friendly object.
 */
export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) throw new Error('UNAUTHORIZED')
  if (!user.active) throw new Error('FORBIDDEN')
  return user
}

/**
 * Helper: require super_admin role.
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'super_admin') throw new Error('FORBIDDEN')
  return user
}
