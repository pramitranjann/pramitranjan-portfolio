export type EntrySource = "voice" | "text";
export type ReportType = "eod" | "morning";

export interface EntryRecord {
  id: string;
  user_id: string;
  content: string;
  source: EntrySource;
  local_date: string;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  user_id: string;
  type: ReportType;
  content: string;
  local_date: string;
  created_at: string;
}

export interface SummaryRecord {
  id: string;
  user_id: string;
  content: string;
  week_start: string;
  created_at: string;
}

export interface SettingsRecord {
  user_id: string;
  timezone: string | null;
  eod_hour: number;
  eod_minute: number;
  updated_at: string;
}

export interface CalendarEventRecord {
  id: string;
  user_id: string;
  title: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  source: string;
  local_date: string;
  synced_at: string;
}

export interface DayHistory {
  localDate: string;
  entryCount: number;
  hasEod: boolean;
  hasMorning: boolean;
}
