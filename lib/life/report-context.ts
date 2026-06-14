import { OWNER_ID, OWNER_PROFILE } from '@/lib/life/constants'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, EntryRecord, ReportRecord, SummaryRecord } from '@/lib/life/types'

export interface ReportContext {
  summaries: SummaryRecord[];
  priorEods: ReportRecord[];
  events: CalendarEventRecord[];
  entries: EntryRecord[];
}

export async function loadDailyContext(localDate: string) {
  const supabase = getSupabaseAdmin();

  const [{ data: summaries, error: summariesError }, { data: priorEods, error: reportsError }, { data: events, error: eventsError }, { data: entries, error: entriesError }] = await Promise.all([
    supabase
      .from("summaries")
      .select("*")
      .eq("user_id", OWNER_ID)
      .order("week_start", { ascending: false })
      .limit(3)
      .returns<SummaryRecord[]>(),
    supabase
      .from("reports")
      .select("*")
      .eq("user_id", OWNER_ID)
      .eq("type", "eod")
      .lt("local_date", localDate)
      .order("local_date", { ascending: false })
      .limit(2)
      .returns<ReportRecord[]>(),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", OWNER_ID)
      .eq("local_date", localDate)
      .order("start_time", { ascending: true })
      .returns<CalendarEventRecord[]>(),
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", OWNER_ID)
      .eq("local_date", localDate)
      .order("created_at", { ascending: true })
      .returns<EntryRecord[]>(),
  ]);

  if (summariesError || reportsError || eventsError || entriesError) {
    throw summariesError || reportsError || eventsError || entriesError;
  }

  return {
    summaries: summaries || [],
    priorEods: priorEods || [],
    events: events || [],
    entries: entries || [],
  } satisfies ReportContext;
}

function formatEvents(events: CalendarEventRecord[], timeZone: string) {
  if (events.length === 0) {
    return "No calendar events for this day.";
  }

  return events
    .map((event) => {
      const range = event.all_day
        ? "All day"
        : `${event.start_time ? getLocalTimeLabel(event.start_time, timeZone) : "unknown start"} → ${event.end_time ? getLocalTimeLabel(event.end_time, timeZone) : "unknown end"}`;
      return `- ${event.title || "(Untitled event)"} — ${range}`;
    })
    .join("\n");
}

function formatEntries(entries: EntryRecord[], timeZone: string) {
  if (entries.length === 0) {
    return "No entries captured for this day.";
  }

  return entries
    .map((entry) => `- [${getLocalTimeLabel(entry.created_at, timeZone)}] ${entry.content}`)
    .join("\n");
}

export function buildEodPrompt(localDate: string, timeZone: string, context: ReportContext) {
  const recentSummaries = context.summaries.length
    ? context.summaries.map((summary) => `Week of ${summary.week_start}\n${summary.content}`).join("\n\n")
    : "No weekly summaries yet.";
  const priorReports = context.priorEods.length
    ? context.priorEods.map((report) => `${report.local_date}\n${report.content}`).join("\n\n")
    : "No prior EOD reports yet.";

  return [
    OWNER_PROFILE,
    `Target local date: ${localDate}`,
    `Recent weekly summaries:\n${recentSummaries}`,
    `Last end-of-day reports:\n${priorReports}`,
    `Today's calendar events:\n${formatEvents(context.events, timeZone)}`,
    `Today's entries in chronological order:\n${formatEntries(context.entries, timeZone)}`,
  ].join("\n\n");
}

export function buildMorningPrompt(localDate: string, timeZone: string, yesterdayReport: ReportRecord | null, context: ReportContext) {
  return [
    OWNER_PROFILE,
    `Target local date: ${localDate}`,
    `Yesterday's end-of-day report:\n${yesterdayReport?.content || "No EOD report for yesterday."}`,
    `Recent weekly summaries:\n${context.summaries.map((summary) => `Week of ${summary.week_start}\n${summary.content}`).join("\n\n") || "No weekly summaries yet."}`,
    `Today's calendar events:\n${formatEvents(context.events, timeZone)}`,
  ].join("\n\n");
}
