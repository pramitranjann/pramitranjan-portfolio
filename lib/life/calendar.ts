import { google } from 'googleapis'

import { OWNER_ID } from '@/lib/life/constants'
import { getLifeServerEnv } from '@/lib/life/env'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { addDays, getCurrentLocalDate, getLocalDateString, getLocalDayRange, localDateTimeToUtc } from '@/lib/life/time'
import type { CalendarEventRecord } from '@/lib/life/types'

function getCalendarClient() {
  const { googleClientId, googleClientSecret, googleRefreshToken } = getLifeServerEnv()
  const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret);
  oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function syncCalendarEvents(targetLocalDate?: string) {
  const { googleCalendarId } = getLifeServerEnv()
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const supabase = getSupabaseAdmin();
  const calendar = getCalendarClient();
  const baseDate = targetLocalDate || getCurrentLocalDate(timeZone);
  const windowStart = addDays(baseDate, -1);
  const windowEnd = addDays(baseDate, 7);
  const timeMin = getLocalDayRange(windowStart, timeZone).start.toISOString();
  const timeMax = getLocalDayRange(windowEnd, timeZone).end.toISOString();

  const response = await calendar.events.list({
    calendarId: googleCalendarId,
    singleEvents: true,
    orderBy: "startTime",
    timeMin,
    timeMax,
    maxResults: 250,
  });

  const events = (response.data.items || [])
    .filter((event) => event.id)
    .map((event) => {
      const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
      const startDate = event.start?.date;
      const startTime = event.start?.dateTime;
      const endDate = event.end?.date;
      const endTime = event.end?.dateTime;
      const localDate = isAllDay && startDate
        ? startDate
        : getLocalDateString(new Date(startTime || event.created || Date.now()), timeZone);

      return {
        id: event.id as string,
        user_id: OWNER_ID,
        title: event.summary || "(Untitled event)",
        start_time: isAllDay && startDate
          ? localDateTimeToUtc(startDate, timeZone, 0, 0, 0).toISOString()
          : startTime || null,
        end_time: isAllDay && endDate
          ? localDateTimeToUtc(endDate, timeZone, 0, 0, 0).toISOString()
          : endTime || null,
        all_day: isAllDay,
        source: "google",
        local_date: localDate,
        synced_at: new Date().toISOString(),
      } satisfies CalendarEventRecord;
    });

  if (events.length > 0) {
    const { error } = await supabase
      .from("calendar_events")
      .upsert(events, { onConflict: "id" });

    if (error) {
      throw error;
    }
  }

  return {
    synced: events.length,
    localDate: baseDate,
    timeZone,
    events,
  };
}
