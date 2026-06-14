import { EOD_SYSTEM_PROMPT, MORNING_SYSTEM_PROMPT, OWNER_ID, WEEKLY_SYSTEM_PROMPT } from '@/lib/life/constants'
import { callClaude } from '@/lib/life/claude'
import { buildEodPrompt, buildMorningPrompt, loadDailyContext } from '@/lib/life/report-context'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { sendReportEmail } from '@/lib/life/email'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { addDays, getCurrentLocalClock, getCurrentLocalDate, getWeekStart, isMorningBriefWindow } from '@/lib/life/time'
import type { ReportRecord, SummaryRecord } from '@/lib/life/types'

export async function getExistingReport(localDate: string, type: "eod" | "morning") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", OWNER_ID)
    .eq("local_date", localDate)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function generateEodReport(options?: { localDate?: string; force?: boolean }) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const localDate = options?.localDate || getCurrentLocalDate(timeZone);
  const force = Boolean(options?.force);
  const clock = getCurrentLocalClock(timeZone);

  if (!force && (clock.hour !== settings.eod_hour || clock.minute !== settings.eod_minute)) {
    return {
      skipped: true,
      reason: "Not in scheduled EOD window.",
      localDate,
      timeZone,
    };
  }

  const existing = await getExistingReport(localDate, "eod");
  if (existing) {
    return {
      skipped: true,
      reason: "EOD already exists for this date.",
      localDate,
      timeZone,
      report: existing,
    };
  }

  await syncCalendarEvents(localDate);
  const context = await loadDailyContext(localDate);
  const markdown = await callClaude({
    system: EOD_SYSTEM_PROMPT,
    user: buildEodPrompt(localDate, timeZone, context),
    maxTokens: 1400,
  });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reports")
    .upsert(
      {
        user_id: OWNER_ID,
        type: "eod",
        content: markdown,
        local_date: localDate,
      },
      { onConflict: "user_id,type,local_date" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  void sendReportEmail(`EOD — ${localDate}`, markdown);

  return {
    skipped: false,
    localDate,
    timeZone,
    report: data,
  };
}

export async function generateMorningBrief(options?: { localDate?: string; force?: boolean }) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const localDate = options?.localDate || getCurrentLocalDate(timeZone);
  const force = Boolean(options?.force);

  if (!force && !isMorningBriefWindow(timeZone)) {
    return {
      skipped: true,
      reason: "Morning brief window has passed.",
      localDate,
      timeZone,
    };
  }

  const existing = await getExistingReport(localDate, "morning");
  if (existing) {
    return {
      skipped: true,
      reason: "Morning brief already exists for this date.",
      localDate,
      timeZone,
      report: existing,
    };
  }

  await syncCalendarEvents(localDate);
  const yesterday = addDays(localDate, -1);
  const supabase = getSupabaseAdmin();
  const { data: yesterdayReport, error: yesterdayError } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", OWNER_ID)
    .eq("local_date", yesterday)
    .eq("type", "eod")
    .maybeSingle();

  if (yesterdayError) {
    throw yesterdayError;
  }

  const context = await loadDailyContext(localDate);
  const markdown = await callClaude({
    system: MORNING_SYSTEM_PROMPT,
    user: buildMorningPrompt(localDate, timeZone, yesterdayReport, context),
    maxTokens: 800,
  });

  const { data, error } = await supabase
    .from("reports")
    .upsert(
      {
        user_id: OWNER_ID,
        type: "morning",
        content: markdown,
        local_date: localDate,
      },
      { onConflict: "user_id,type,local_date" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  void sendReportEmail(`Morning — ${localDate}`, markdown);

  return {
    skipped: false,
    localDate,
    timeZone,
    report: data,
  };
}

export async function generateWeeklySummary(options?: { localDate?: string; force?: boolean }) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const today = options?.localDate || getCurrentLocalDate(timeZone);
  const currentWeekStart = getWeekStart(today);
  const targetWeekStart = addDays(currentWeekStart, -7);
  const targetWeekEnd = addDays(currentWeekStart, -1);
  const supabase = getSupabaseAdmin();

  const { data: existing, error: existingError } = await supabase
    .from("summaries")
    .select("*")
    .eq("user_id", OWNER_ID)
    .eq("week_start", targetWeekStart)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing && !options?.force) {
    return {
      skipped: true,
      reason: "Weekly summary already exists.",
      weekStart: targetWeekStart,
      summary: existing,
    };
  }

  const [{ data: entries, error: entriesError }, { data: reports, error: reportsError }] = await Promise.all([
    supabase
      .from("entries")
      .select("local_date, created_at, content")
      .eq("user_id", OWNER_ID)
      .gte("local_date", targetWeekStart)
      .lte("local_date", targetWeekEnd)
      .order("local_date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("reports")
      .select("local_date, type, content")
      .eq("user_id", OWNER_ID)
      .gte("local_date", targetWeekStart)
      .lte("local_date", targetWeekEnd)
      .order("local_date", { ascending: true }),
  ]);

  if (entriesError || reportsError) {
    throw entriesError || reportsError;
  }

  const input = [
    `Week start: ${targetWeekStart}`,
    `Week end: ${targetWeekEnd}`,
    `Entries:\n${(entries || []).map((entry) => `- ${entry.local_date} ${entry.created_at}: ${entry.content}`).join("\n") || "No entries."}`,
    `Reports:\n${(reports || []).map((report) => `- ${report.local_date} ${report.type}: ${report.content}`).join("\n\n") || "No reports."}`,
  ].join("\n\n");

  const content = await callClaude({
    system: WEEKLY_SYSTEM_PROMPT,
    user: input,
    maxTokens: 900,
  });

  const { data, error } = await supabase
    .from("summaries")
    .upsert(
      {
        user_id: OWNER_ID,
        week_start: targetWeekStart,
        content,
      },
      { onConflict: "user_id,week_start" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    skipped: false,
    weekStart: targetWeekStart,
    summary: data,
  };
}
