"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { getEntryPresentation } from '@/lib/life/entries'
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
    <div className="life-history-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Entries</p>
          <h1>Everything you captured</h1>
        </div>
        <span className="life-row-aside">{days.reduce((sum, day) => sum + day.entryCount, 0)} total</span>
      </div>

      <div className="life-history-grid">
        <aside className="life-card life-history-sidebar">
          <div className="life-card-head">
            <h2>Days</h2>
            <span className="count-pill">{days.length}</span>
          </div>
          <label className="field compact-field life-history-search">
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
          <ul className="life-history-days">
            {days.map((day) => (
              <li key={day.localDate}>
                <button
                  className={`life-history-day${selectedDate === day.localDate ? " is-selected" : ""}`}
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
        </aside>

        <section className="life-card life-history-detail">
          <div className="life-card-head">
            <h2>{selectedDate ? getDisplayDate(selectedDate, timezone) : 'Select a day'}</h2>
            {selectedDate ? <span className="count-pill">{entries.length}</span> : null}
          </div>

          <div className="life-history-detail-body">
            {entries.length === 0 ? (
              <p className="muted-text">No entries for this day.</p>
            ) : (
              <ul className="life-history-list">
                {entries.map((entry) => {
                  const presentation = getEntryPresentation(entry)
                  return (
                    <li className="life-history-entry" key={entry.id}>
                      <div className="life-history-entry-head">
                        <span className="life-capture-time">{getLocalTimeLabel(entry.created_at, timezone)}</span>
                        <span className="life-entry-kind" style={{ color: presentation.color }}>
                          {presentation.kind}
                        </span>
                      </div>
                      {entry.project_slug ? (
                        <span className="life-tag">{getProjectLabel(entry.project_slug) || entry.project_slug}</span>
                      ) : null}
                      <p className="life-capture-text">{entry.content}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
