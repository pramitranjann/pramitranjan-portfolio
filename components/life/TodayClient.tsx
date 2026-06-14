"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { fetchJson } from '@/lib/life/client'
import { getDisplayDate, getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, EntryRecord, ReportRecord } from '@/lib/life/types'
import { MarkdownCard } from '@/components/life/MarkdownCard'

interface TodayResponse {
  localDate: string;
  timezone: string;
  entries: EntryRecord[];
}

interface ReportsResponse {
  localDate: string;
  timezone: string;
  reports: ReportRecord[];
}

interface CalendarResponse {
  localDate: string;
  timezone: string;
  events: CalendarEventRecord[];
}

interface SynthesisResponse {
  skipped: boolean;
  report?: ReportRecord;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function TodayClient() {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [events, setEvents] = useState<CalendarEventRecord[]>([]);
  const [morningReport, setMorningReport] = useState<ReportRecord | null>(null);
  const [timezone, setTimezone] = useState("UTC");
  const [localDate, setLocalDate] = useState("");
  const [draft, setDraft] = useState("");
  const [draftSource, setDraftSource] = useState<"voice" | "text">("text");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");

  const displayDate = useMemo(
    () => (localDate ? getDisplayDate(localDate, timezone) : "Today"),
    [localDate, timezone],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [entriesPayload, reportsPayload, calendarPayload] = await Promise.all([
          fetchJson<TodayResponse>('/api/life/entries'),
          fetchJson<ReportsResponse>('/api/life/reports'),
          fetchJson<CalendarResponse>('/api/life/calendar'),
        ]);

        if (cancelled) {
          return;
        }

        setEntries(entriesPayload.entries);
        setEvents(calendarPayload.events);
        setTimezone(entriesPayload.timezone);
        setLocalDate(entriesPayload.localDate);

        const morning = reportsPayload.reports.find((report) => report.type === "morning") || null;
        setMorningReport(morning);

        if (!morning) {
          const synthesis = await fetchJson<SynthesisResponse>('/api/life/synthesis/morning', {
            method: 'POST',
            body: JSON.stringify({ force: false }),
          }).catch(() => null);

          if (!cancelled && synthesis?.report) {
            setMorningReport(synthesis.report);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load today.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    const Recognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim();
          setDraft(finalTranscriptRef.current);
          setDraftSource("voice");
        }

        setInterimTranscript(interimText.trim());
      };
      recognition.onerror = () => {
        setListening(false);
        setError("Voice capture failed. Safari on iPhone is the most reliable option.");
      };
      recognition.onend = () => {
        setListening(false);
        setInterimTranscript("");
        if (finalTranscriptRef.current) {
          setDraft(finalTranscriptRef.current);
          setDraftSource("voice");
        }
      };

      recognitionRef.current = recognition;
      setVoiceSupported(true);
    }

    return () => {
      cancelled = true;
      recognitionRef.current?.stop();
    };
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      setError("Voice capture is unavailable in this browser.");
      return;
    }

    setError(null);

    if (listening) {
      recognitionRef.current.stop();
      return;
    }

    finalTranscriptRef.current = draftSource === "voice" ? draft : "";
    setInterimTranscript("");
    recognitionRef.current.start();
    setListening(true);
  }

  async function saveEntry() {
    const content = draft.trim();
    if (!content) {
      return;
    }

    setSaving(true);
    setError(null);

    const optimisticEntry: EntryRecord = {
      id: `optimistic-${Date.now()}`,
      user_id: "owner",
      content,
      source: draftSource,
      local_date: localDate,
      created_at: new Date().toISOString(),
    };

    setEntries((current) => [optimisticEntry, ...current]);
    setDraft("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";

    try {
      const payload = await fetchJson<{ entry: EntryRecord; localDate: string; timezone: string }>('/api/life/entries', {
        method: 'POST',
        body: JSON.stringify({
          content,
          source: draftSource,
        }),
      });

      setEntries((current) => [payload.entry, ...current.filter((entry) => entry.id !== optimisticEntry.id)]);
      setLocalDate(payload.localDate);
      setTimezone(payload.timezone);
      setDraftSource("text");
    } catch (saveError) {
      setEntries((current) => current.filter((entry) => entry.id !== optimisticEntry.id));
      setDraft(content);
      setError(saveError instanceof Error ? saveError.message : "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Today</p>
        <h1>{displayDate}</h1>
        <p className="hero-copy">
          Capture the day in fragments. The app stores each note under the owner timezone,
          then turns the full thread into an end-of-day brief.
        </p>

        <div className="capture-stack">
          <button
            className={`mic-button ${listening ? "is-live" : ""}`}
            disabled={!voiceSupported}
            onClick={toggleListening}
            type="button"
          >
            {listening ? "Stop listening" : voiceSupported ? "Start voice capture" : "Voice unavailable"}
          </button>
          <p className="muted-text">
            Best on Safari for iPhone. Text input is always available.
          </p>
          {interimTranscript ? <div className="interim-chip">Live: {interimTranscript}</div> : null}
          <textarea
            className="draft-area"
            rows={6}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDraftSource("text");
            }}
            placeholder="Type or dictate the raw note here."
          />
          <button className="primary-button" disabled={saving || !draft.trim()} onClick={saveEntry} type="button">
            {saving ? "Saving..." : "Save entry"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </section>

      {morningReport ? (
        <section className="panel-card">
          <details>
            <summary className="summary-toggle">Morning brief</summary>
            <MarkdownCard content={morningReport.content} />
          </details>
        </section>
      ) : null}

      <section className="panel-card">
        <div className="section-head">
          <h2>Scheduled today</h2>
          <span className="count-pill">{events.length}</span>
        </div>
        {events.length === 0 ? (
          <p className="muted-text">No synced calendar events yet.</p>
        ) : (
          <ul className="timeline-list">
            {events.map((event) => (
              <li className="timeline-item" key={event.id}>
                <div>
                  <strong>{event.title || "(Untitled event)"}</strong>
                  <p className="muted-text">
                    {event.all_day
                      ? "All day"
                      : `${event.start_time ? getLocalTimeLabel(event.start_time, timezone) : "Unknown"} to ${event.end_time ? getLocalTimeLabel(event.end_time, timezone) : "Unknown"}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <h2>Today&apos;s entries</h2>
          <span className="count-pill">{entries.length}</span>
        </div>
        {loading ? <p className="muted-text">Loading entries...</p> : null}
        {!loading && entries.length === 0 ? <p className="muted-text">No entries yet.</p> : null}
        <ul className="timeline-list">
          {entries.map((entry) => (
            <li className="timeline-item" key={entry.id}>
              <div className="timeline-meta">
                <span>{getLocalTimeLabel(entry.created_at, timezone)}</span>
                <span>{entry.source}</span>
              </div>
              <p>{entry.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
