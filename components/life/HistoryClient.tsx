"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { fetchJson } from '@/lib/life/client'
import { getProjectLabel } from '@/lib/life/projects'
import { getDisplayDate, getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, DayHistory, EntryRecord, ReportRecord } from '@/lib/life/types'
import { MarkdownCard } from '@/components/life/MarkdownCard'

interface HistoryPayload {
  timezone: string;
  selectedDate: string;
  days: DayHistory[];
  detail: {
    entries: EntryRecord[];
    reports: ReportRecord[];
    events: CalendarEventRecord[];
  };
}

export function HistoryClient() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedDate, setSelectedDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [days, setDays] = useState<DayHistory[]>([]);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [events, setEvents] = useState<CalendarEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (deferredQuery.trim()) {
          params.set("q", deferredQuery.trim());
        }
        if (selectedDate) {
          params.set("date", selectedDate);
        }

        const payload = await fetchJson<HistoryPayload>(`/api/life/history?${params.toString()}`);
        if (cancelled) {
          return;
        }

        setTimezone(payload.timezone);
        setDays(payload.days);
        setEntries(payload.detail.entries);
        setReports(payload.detail.reports);
        setEvents(payload.detail.events);

        if (!selectedDate && payload.days[0]) {
          setSelectedDate(payload.days[0].localDate);
        } else if (selectedDate && payload.selectedDate !== selectedDate) {
          setSelectedDate(payload.selectedDate);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deferredQuery, selectedDate]);

  return (
    <div className="history-grid">
      <section className="panel-card">
        <div className="section-head">
          <h1>History</h1>
        </div>
        <label className="field compact-field">
          <span>Search entries</span>
          <input
            className="text-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fragments..."
          />
        </label>

        {loading ? <p className="muted-text">Loading history...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <ul className="history-list">
          {days.map((day) => (
            <li key={day.localDate}>
              <button
                className={`history-row ${selectedDate === day.localDate ? "is-selected" : ""}`}
                onClick={() => setSelectedDate(day.localDate)}
                type="button"
              >
                <div>
                  <strong>{getDisplayDate(day.localDate, timezone)}</strong>
                  <p className="muted-text">{day.entryCount} entries</p>
                </div>
                <div className="badge-row">
                  {day.hasEod ? <span className="badge">EOD</span> : null}
                  {day.hasMorning ? <span className="badge secondary">AM</span> : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-card detail-panel">
        {selectedDate ? (
          <div className="section-head">
            <h2>{getDisplayDate(selectedDate, timezone)}</h2>
          </div>
        ) : null}

        <div className="detail-stack">
          <div>
            <h3>Calendar</h3>
            {events.length === 0 ? <p className="muted-text">No synced events.</p> : null}
            <ul className="timeline-list">
              {events.map((event) => (
                <li className="timeline-item" key={event.id}>
                  <strong>{event.title || "(Untitled event)"}</strong>
                  <p className="muted-text">
                    {event.all_day
                      ? "All day"
                      : `${event.start_time ? getLocalTimeLabel(event.start_time, timezone) : "Unknown"} to ${event.end_time ? getLocalTimeLabel(event.end_time, timezone) : "Unknown"}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Entries</h3>
            {entries.length === 0 ? <p className="muted-text">No entries.</p> : null}
            <ul className="timeline-list">
              {entries.map((entry) => (
                <li className="timeline-item" key={entry.id}>
                  <div className="timeline-meta">
                    <span>{getLocalTimeLabel(entry.created_at, timezone)}</span>
                    <span>{entry.source}</span>
                  </div>
                  {entry.project_slug ? <span className="badge secondary">{getProjectLabel(entry.project_slug) || entry.project_slug}</span> : null}
                  <p>{entry.content}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Reports</h3>
            {reports.length === 0 ? <p className="muted-text">No reports.</p> : null}
            <div className="report-stack">
              {reports.map((report) => (
                <article className="subtle-card" key={report.id}>
                  <p className="eyebrow">{report.type === "eod" ? "End of day" : "Morning brief"}</p>
                  <MarkdownCard content={report.content} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
