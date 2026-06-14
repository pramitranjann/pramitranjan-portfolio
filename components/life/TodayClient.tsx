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

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
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

export function TodayClient({ initialError = null }: { initialError?: string | null }) {
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
  const [voiceHint, setVoiceHint] = useState("Best on Safari for iPhone. Text input is always available.");
  const [error, setError] = useState<string | null>(initialError);
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

    const Recognition = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

    if (Recognition) {
      setVoiceSupported(true);
      setVoiceHint("Tap once, allow microphone access if Safari asks, then speak.");
    } else {
      setVoiceHint(
        window.isSecureContext
          ? "Safari did not expose speech recognition here. Use the keyboard mic in the textarea instead."
          : "Voice capture requires HTTPS. Open the deployed site instead of a local or insecure page.",
      );
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          if (!cancelled && status.state === "denied") {
            setError("Microphone access is blocked for this site in Safari settings.");
          }
        })
        .catch(() => null);
    }

    return () => {
      cancelled = true;
      recognitionRef.current?.stop();
    };
  }, []);

  function getSpeechErrorMessage(error?: string) {
    switch (error) {
      case "not-allowed":
      case "service-not-allowed":
        return "Safari blocked speech recognition. Reopen the page in Safari, allow mic access, and try again.";
      case "audio-capture":
        return "Safari could not access the microphone. Check Safari site settings and iPhone microphone permissions.";
      case "network":
        return "Speech recognition hit a network error. Try again on a stronger connection.";
      case "no-speech":
        return "No speech was detected. Try again and speak right after tapping the button.";
      case "aborted":
        return "Voice capture stopped before transcription finished.";
      default:
        return "Voice capture failed. If Safari keeps rejecting it, use the keyboard mic in the textarea.";
    }
  }

  function getRecognition() {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const Recognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!Recognition) {
      return null;
    }

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
    recognition.onerror = (event) => {
      setListening(false);
      setError(getSpeechErrorMessage(event.error));
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
    return recognition;
  }

  async function requestMicrophoneAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  }

  async function toggleListening() {
    if (!voiceSupported) {
      setError("Voice capture is unavailable in this browser context. Use the keyboard mic in the textarea.");
      return;
    }

    setError(null);

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    finalTranscriptRef.current = draftSource === "voice" ? draft : "";
    setInterimTranscript("");

    try {
      await requestMicrophoneAccess();
      const recognition = getRecognition();

      if (!recognition) {
        setVoiceSupported(false);
        setError("Safari did not expose speech recognition here. Use the keyboard mic in the textarea instead.");
        return;
      }

      recognition.start();
      setListening(true);
    } catch (startError) {
      setListening(false);
      setError(startError instanceof Error ? startError.message : "Voice capture failed to start.");
    }
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveEntry();
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

        <form action="/api/life/entries" className="capture-stack" method="post" onSubmit={handleSubmit}>
          <input name="source" type="hidden" value={draftSource} />
          <button
            className={`mic-button ${listening ? "is-live" : ""}`}
            disabled={!voiceSupported}
            onClick={toggleListening}
            type="button"
          >
            {listening ? "Stop listening" : voiceSupported ? "Start voice capture" : "Voice unavailable"}
          </button>
          <p className="muted-text">{voiceHint}</p>
          {interimTranscript ? <div className="interim-chip">Live: {interimTranscript}</div> : null}
          <textarea
            className="draft-area"
            name="content"
            rows={6}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDraftSource("text");
            }}
            placeholder="Type or dictate the raw note here."
          />
          <button
            className="primary-button"
            disabled={saving || (typeof window !== "undefined" ? !draft.trim() : false)}
            type="submit"
          >
            {saving ? "Saving..." : "Save entry"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
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
