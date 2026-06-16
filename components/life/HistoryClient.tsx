"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { fetchJson } from '@/lib/life/client'
import { getProjectLabel } from '@/lib/life/projects'
import { getDisplayDate, getLocalTimeLabel } from '@/lib/life/time'
import type { DayHistory, EntryRecord } from '@/lib/life/types'

interface HistoryPayload {
  timezone: string;
  selectedDate: string;
  days: DayHistory[];
  detail: {
    entries: EntryRecord[];
    reports: unknown[];
    events: unknown[];
  };
}

export function HistoryClient() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedDate, setSelectedDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [days, setDays] = useState<DayHistory[]>([]);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
        if (selectedDate) params.set("date", selectedDate);

        const payload = await fetchJson<HistoryPayload>(`/api/life/history?${params.toString()}`);
        if (cancelled) return;

        setTimezone(payload.timezone);
        setDays(payload.days);
        setEntries(payload.detail.entries);

        if (!selectedDate && payload.days[0]) {
          setSelectedDate(payload.days[0].localDate);
        } else if (selectedDate && payload.selectedDate !== selectedDate) {
          setSelectedDate(payload.selectedDate);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Failed to load entries.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [deferredQuery, selectedDate]);

  return (
    <div className="history-grid">
      <section className="panel-card">
        <div className="section-head">
          <h1>Entries</h1>
        </div>
        <label className="field compact-field">
          <span>Search</span>
          <input
            className="text-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
          />
        </label>

        {loading ? <p className="muted-text">Loading…</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <ul className="history-list">
          {days.map((day) => (
            <li key={day.localDate}>
              <button
                className={`history-row${selectedDate === day.localDate ? " is-selected" : ""}`}
                onClick={() => setSelectedDate(day.localDate)}
                type="button"
              >
                <div>
                  <strong>{getDisplayDate(day.localDate, timezone)}</strong>
                  <p className="muted-text">{day.entryCount} entries</p>
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
          {entries.length === 0 ? (
            <p className="muted-text">No entries for this day.</p>
          ) : (
            <ul className="timeline-list">
              {entries.map((entry) => (
                <li className="timeline-item" key={entry.id}>
                  <div className="timeline-meta">
                    <span>{getLocalTimeLabel(entry.created_at, timezone)}</span>
                    <span style={{ color: entry.source === 'voice' ? 'var(--life-accent)' : 'var(--life-label)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {entry.source === 'voice' ? 'Voice' : 'Text'}
                    </span>
                  </div>
                  {entry.project_slug ? (
                    <span className="badge secondary">{getProjectLabel(entry.project_slug) || entry.project_slug}</span>
                  ) : null}
                  <p>{entry.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
