import { cache } from 'react'
import { cacheLife } from 'next/cache'

import type { SettingsRecord } from '@/lib/life/types'

import { OWNER_ID } from '@/lib/life/constants'
import { getLifeServerEnv } from '@/lib/life/env'
import { getSupabaseAdmin } from '@/lib/life/supabase'

// React cache() deduplicates within a single render; 'use cache' + cacheLife
// caches the result across requests for up to 5 minutes. Settings almost
// never change mid-session so this is safe and eliminates a Supabase
// round-trip on every page navigation.
export const getOwnerSettings = cache(async function getOwnerSettings() {
  'use cache'
  cacheLife('minutes')

  const supabase = getSupabaseAdmin();
  const { ownerTimezone } = getLifeServerEnv()
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", OWNER_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return {
      ...data,
      timezone: data.timezone || ownerTimezone,
    };
  }

  const fallback: Omit<SettingsRecord, "updated_at"> = {
    user_id: OWNER_ID,
    timezone: ownerTimezone,
    eod_hour: 22,
    eod_minute: 30,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("settings")
    .upsert(fallback, { onConflict: "user_id" })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return {
    ...inserted,
    timezone: inserted.timezone || ownerTimezone,
  };
})
