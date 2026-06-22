export type EntrySource = "voice" | "text";
export type ReportType = "eod" | "morning" | "weekly";
export type TaskStatus = "open" | "in_progress" | "done" | "dismissed";
export type TaskPriority = "high" | "medium" | "low";

export interface EntryRecord {
  id: string;
  user_id: string;
  content: string;
  source: EntrySource;
  project_slug: string | null;
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
  calendar_id: string | null;
  calendar_name: string | null;
  location: string | null;
  notes: string | null;
  html_link: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  source: string;
  local_date: string;
  updated_at: string;
  synced_at: string;
}

export interface DayHistory {
  localDate: string;
  entryCount: number;
  hasEod: boolean;
  hasMorning: boolean;
}

export interface TaskRecord {
  id: string;
  user_id: string;
  title: string;
  details: string | null;
  project_slug: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_local_date: string | null;
  source_type: string;
  source_local_date: string | null;
  source_report_id: string | null;
  auto_generated: boolean;
  fingerprint: string | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/** A linked calendar event, denormalised for rendering on a task card. */
export interface TaskLinkedEvent {
  id: string;
  title: string;
  startTime: string | null;
  allDay: boolean;
  htmlLink: string | null;
}

/** How a task create/edit should affect the calendar. */
export type TaskCalendarIntent =
  | { mode: "none" }
  | { mode: "event"; startTime?: string | null; endTime?: string | null }
  | { mode: "link"; eventId: string }
  | { mode: "unlink" };

/** The shape the shared TaskForm emits on submit. */
export interface TaskDraft {
  title: string;
  details: string | null;
  projectSlug: string | null;
  priority: TaskPriority;
  dueLocalDate: string | null;
  calendar: TaskCalendarIntent;
}

export interface TaskCandidate {
  title: string;
  details: string | null;
  projectSlug: string | null;
  priority: TaskPriority;
  dueLocalDate: string | null;
}

export interface LifeSearchTaskHit {
  id: string;
  href: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectLabel: string;
  dueLabel: string | null;
}

export interface LifeSearchEntryHit {
  id: string;
  href: string;
  content: string;
  kind: string;
  kindColor: string;
  projectLabel: string | null;
  dayLabel: string;
  timeLabel: string;
}

export interface LifeSearchEventHit {
  id: string;
  href: string;
  title: string;
  timeLabel: string;
  dayLabel: string;
}

export interface LifeSearchResults {
  query: string;
  hasQuery: boolean;
  totalResults: number;
  tasks: LifeSearchTaskHit[];
  entries: LifeSearchEntryHit[];
  events: LifeSearchEventHit[];
}
