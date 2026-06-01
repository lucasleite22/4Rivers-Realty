import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Use in Client Components ('use client').
 * Singleton pattern to avoid multiple instances.
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
