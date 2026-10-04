import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Public by design (the anon key only allows what row-level security permits).
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Accounts and sync exist only in builds configured with a Supabase project. */
export const cloudEnabled = Boolean(URL && ANON_KEY)

let client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (!cloudEnabled) throw new Error('Cloud features are not configured in this build')
  client ??= createClient(URL!, ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Email confirmation and password reset use 6-digit codes, not links.
      detectSessionInUrl: false,
      storageKey: 'thinksprout-auth',
    },
  })
  return client
}
