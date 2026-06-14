import { createClient } from '@supabase/supabase-js'

import { getLifeServerEnv } from '@/lib/life/env'

export function getSupabaseAdmin() {
  const { supabaseUrl, supabaseServiceRoleKey } = getLifeServerEnv()
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
