"use client";

import { useEffect, useState, useTransition } from "react";

import { fetchJson } from '@/lib/life/client'
import { getDisplayDate } from '@/lib/life/time'
import type { ReportRecord } from '@/lib/life/types'
import { MarkdownCard } from '@/components/life/MarkdownCard'

interface ReportsResponse {
  localDate: string;
  timezone: string;
  reports: ReportRecord[];
}

interface SynthesisResponse {
  skipped: boolean;
  report?: ReportRecord;
}

export function ReportClient() {
  const [selectedDate, setSelectedDate] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const payload = await fetchJson<ReportsResponse>('/api/life/reports?type=eod');
        if (cancelled) {
          return;
        }

        setTimezone(payload.timezone);
        setTodayDate(payload.localDate);
        const latest = payload.reports[0] || null;
        setReport(latest);
        setSelectedDate(latest?.local_date || payload.localDate);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    startTransition(async () => {
      try {
        const payload = await fetchJson<ReportsResponse>(`/api/life/reports?type=eod&date=${selectedDate}`);
        setTimezone(payload.timezone);
        setReport(payload.reports[0] || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load report.");
      }
    });
  }, [selectedDate]);

  async function generateNow() {
    try {
      setError(null);
      const payload = await fetchJson<SynthesisResponse>('/api/life/synthesis/eod', {
        method: 'POST',
        body: JSON.stringify({
          localDate: selectedDate || todayDate,
          force: true,
        }),
      });

      if (payload.report) {
        setReport(payload.report);
        setSelectedDate(payload.report.local_date);
      }
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Failed to generate report.");
    }
  }

  const showGenerate = Boolean(todayDate) && selectedDate === todayDate && !report;

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">End of day</p>
        <h1>Review the thread, not the fragments.</h1>
        <p className="hero-copy">
          Pull the latest EOD report or generate today&apos;s on demand before the scheduled run.
        </p>

        <div className="toolbar">
          <label className="field compact-field">
            <span>Date</span>
            <input
              className="text-input"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
          {showGenerate ? (
            <button className="primary-button" onClick={generateNow} type="button">
              Generate now
            </button>
          ) : null}
        </div>
      </section>

      <section className="panel-card report-panel">
        {loading || isPending ? <p className="muted-text">Loading report...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !isPending && !report ? (
          <p className="muted-text">
            No EOD report for {selectedDate ? getDisplayDate(selectedDate, timezone) : "this day"}.
          </p>
        ) : null}
        {report ? (
          <>
            <div className="section-head">
              <h2>{getDisplayDate(report.local_date, timezone)}</h2>
            </div>
            <MarkdownCard content={report.content} />
          </>
        ) : null}
      </section>
    </div>
  );
}
