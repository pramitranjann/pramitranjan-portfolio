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

function getConfiguredCalendarIds() {
  const { googleCalendarId } = getLifeServerEnv()
  const normalized = googleCalendarId.trim()
  if (!normalized || normalized === 'primary') {
    return []
  }

  return normalized
    .split(',')
    .map((calendarId) => calendarId.trim())
    .filter(Boolean)
}

async function getCalendarIdsToSync(calendar: ReturnType<typeof google.calendar>) {
  const configuredCalendarIds = getConfiguredCalendarIds()
  if (configuredCalendarIds.length > 0) {
    return configuredCalendarIds
  }

  const response = await calendar.calendarList.list({
    showDeleted: false,
    showHidden: false,
  })

  const calendarIds = new Set<string>()
  for (const item of response.data.items || []) {
    if (!item.id) {
      continue
    }

    if (item.primary || item.selected) {
      calendarIds.add(item.id)
    }
  }

  if (calendarIds.size === 0) {
    calendarIds.add('primary')
  }

  return Array.from(calendarIds)
}

export async function syncCalendarEvents(targetLocalDate?: string) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const supabase = getSupabaseAdmin();
  const calendar = getCalendarClient();
  const baseDate = targetLocalDate || getCurrentLocalDate(timeZone);
  const windowStart = addDays(baseDate, -1);
  const windowEnd = addDays(baseDate, 7);
  const timeMin = getLocalDayRange(windowStart, timeZone).start.toISOString();
  const timeMax = getLocalDayRange(windowEnd, timeZone).end.toISOString();
  const calendarIds = await getCalendarIdsToSync(calendar)

  const responses = await Promise.all(
    calendarIds.map((calendarId) =>
      calendar.events.list({
        calendarId,
        singleEvents: true,
        orderBy: "startTime",
        timeMin,
        timeMax,
        maxResults: 250,
      }).then((response) => ({ calendarId, items: response.data.items || [] })),
    ),
  )

  const eventMap = new Map<string, CalendarEventRecord>()
  for (const { items } of responses) {
    for (const event of items) {
      if (!event.id && !event.iCalUID) {
        continue
      }

      const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
      const startDate = event.start?.date;
      const startTime = event.start?.dateTime;
      const endDate = event.end?.date;
      const endTime = event.end?.dateTime;
      const localDate = isAllDay && startDate
        ? startDate
        : getLocalDateString(new Date(startTime || event.created || Date.now()), timeZone);

      const mappedEvent = {
        id: (event.iCalUID || event.id) as string,
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

      eventMap.set(mappedEvent.id, mappedEvent)
    }
  }

  const events = Array.from(eventMap.values())

  const { error: deleteError } = await supabase
    .from("calendar_events")
    .delete()
    .eq("user_id", OWNER_ID)
    .eq("source", "google")
    .gte("local_date", windowStart)
    .lte("local_date", windowEnd)

  if (deleteError) {
    throw deleteError
  }

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
    calendarIds,
    events,
  };
}
