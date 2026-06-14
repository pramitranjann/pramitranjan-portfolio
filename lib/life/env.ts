function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export function getLifeServerEnv() {
  return {
    supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
    resendApiKey: requireEnv('RESEND_API_KEY'),
    cronSecret: requireEnv('CRON_SECRET'),
    ownerEmail: process.env.OWNER_EMAIL || 'pramit@pramitranjan.com',
    ownerTimezone: process.env.OWNER_TIMEZONE || 'UTC',
    googleClientId: requireEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    googleRefreshToken: requireEnv('GOOGLE_REFRESH_TOKEN'),
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  }
}
