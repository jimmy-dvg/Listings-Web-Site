import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://example.supabase.co',
  supabasePublishableKey ?? 'public-anon-key',
)
