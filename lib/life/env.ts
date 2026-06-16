function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export function getLifeServerEnv() {
  return {
    get supabaseUrl() {
      return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
    },
    get supabaseServiceRoleKey() {
      return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    },
    get anthropicApiKey() {
      return requireEnv('ANTHROPIC_API_KEY')
    },
    get resendApiKey() {
      return requireEnv('RESEND_API_KEY')
    },
    get cronSecret() {
      return requireEnv('CRON_SECRET')
    },
    ownerEmail: process.env.OWNER_EMAIL || 'pramit@pramitranjan.com',
    ownerTimezone: process.env.OWNER_TIMEZONE || 'UTC',
    get googleClientId() {
      return requireEnv('GOOGLE_CLIENT_ID')
    },
    get googleClientSecret() {
      return requireEnv('GOOGLE_CLIENT_SECRET')
    },
    get googleRefreshToken() {
      return requireEnv('GOOGLE_REFRESH_TOKEN')
    },
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  }
}
