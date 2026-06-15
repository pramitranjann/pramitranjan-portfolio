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

export async function createCalendarEvent(input: {
  title: string
  localDate: string
  startTime?: string | null
  endTime?: string | null
  allDay?: boolean
}) {
  const settings = await getOwnerSettings()
  const timeZone = settings.timezone
  const calendar = getCalendarClient()
  const title = input.title?.trim()
  if (!title) {
    throw new Error('Event title is required.')
  }

  const targetCalendarId = getConfiguredCalendarIds()[0] || 'primary'

  let requestBody: {
    summary: string
    start: { date?: string; dateTime?: string; timeZone?: string }
    end: { date?: string; dateTime?: string; timeZone?: string }
  }

  if (input.allDay || !input.startTime) {
    requestBody = {
      summary: title,
      start: { date: input.localDate },
      end: { date: addDays(input.localDate, 1) },
    }
  } else {
    const [startHour, startMinute] = input.startTime.split(':').map(Number)
    const start = localDateTimeToUtc(input.localDate, timeZone, startHour, startMinute, 0)
    let end: Date
    if (input.endTime) {
      const [endHour, endMinute] = input.endTime.split(':').map(Number)
      end = localDateTimeToUtc(input.localDate, timeZone, endHour, endMinute, 0)
      if (end.getTime() <= start.getTime()) {
        end = new Date(start.getTime() + 60 * 60 * 1000)
      }
    } else {
      end = new Date(start.getTime() + 60 * 60 * 1000)
    }
    requestBody = {
      summary: title,
      start: { dateTime: start.toISOString(), timeZone },
      end: { dateTime: end.toISOString(), timeZone },
    }
  }

  const response = await calendar.events.insert({
    calendarId: targetCalendarId,
    requestBody,
  })

  return response.data
}

// In-memory throttle so that rapid navigations between Life pages don't each
// pay the full Google Calendar round-trip + Supabase delete/upsert. The cron
// and explicit user actions pass `{ force: true }` to bypass.
const SYNC_TTL_MS = 5 * 60 * 1000
const lastSyncedAt = new Map<string, number>()

export async function syncCalendarEvents(
  startLocalDate?: string,
  endLocalDate?: string,
  options?: { force?: boolean },
) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const baseStart = startLocalDate || getCurrentLocalDate(timeZone);
  const baseEnd = endLocalDate || baseStart;

  const cacheKey = `${baseStart}:${baseEnd}`
  if (!options?.force) {
    const last = lastSyncedAt.get(cacheKey)
    if (last && Date.now() - last < SYNC_TTL_MS) {
      return {
        synced: 0,
        skipped: true as const,
        cached: true as const,
        startLocalDate: baseStart,
        endLocalDate: baseEnd,
        localDate: baseStart,
        timeZone,
        calendarIds: [] as string[],
        events: [] as CalendarEventRecord[],
      }
    }
  }

  const supabase = getSupabaseAdmin();
  const calendar = getCalendarClient();
  const windowStart = addDays(baseStart, -1);
  const windowEnd = addDays(baseEnd, 7);
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

  lastSyncedAt.set(cacheKey, Date.now())

  return {
    synced: events.length,
    startLocalDate: baseStart,
    endLocalDate: baseEnd,
    localDate: baseStart,
    timeZone,
    calendarIds,
    events,
  };
}
