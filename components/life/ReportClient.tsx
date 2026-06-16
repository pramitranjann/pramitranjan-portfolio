'use client'

import { useEffect, useMemo, useState } from 'react'

import { fetchJson } from '@/lib/life/client'
import { getEntryPresentation } from '@/lib/life/entries'
import { parseReportSections, sectionKey } from '@/lib/life/markdown-sections'
import { localDateTimeToUtc } from '@/lib/life/time'
import type {
  CalendarEventRecord,
  EntryRecord,
  ReportRecord,
  TaskRecord,
} from '@/lib/life/types'

interface ReportsListResponse {
  localDate: string
  timezone: string
  reports: ReportRecord[]
}

interface ReportDetailResponse {
  timezone: string
  report: ReportRecord
  context: {
    entries: EntryRecord[]
    events: CalendarEventRecord[]
    openTasks: TaskRecord[]
    completedTasks: TaskRecord[]
  }
}

type ReportDetailState = ReportDetailResponse['context'] & {
  report: ReportRecord
}

interface Metric {
  value: string
  label: string
}

interface StructuredSection {
  label: string
  body: string
}

const TYPE_LABEL: Record<string, string> = {
  eod: 'Evening brief',
  morning: 'Morning brief',
  weekly: 'Week ahead',
}

const FOCUS_EVENT_RE = /\b(build|deep work|focus|maker|design|research|writing|ship|code)\b/i
const TITLE_SECTION_KEYS = [
  'what-happened',
  'what-happened-today',
  'one-thing',
  'one-intention',
  'one-thing-worth-sitting-with',
  'tension',
]
const PULL_QUOTE_KEYS = new Set([
  'one-thing',
  'one-intention',
  'one-thing-worth-sitting-with',
])
const FALLBACK_SECTION_LABELS = [
  'What happened today',
  'What happened',
  'Decisions made',
  'Open loops',
  'Tension',
  'One thing worth sitting with',
  'One thing',
]

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${lookup.day} ${lookup.month}`
}

function stripMarkdown(content: string) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getFallbackStructuredSections(content: string): StructuredSection[] {
  const clean = stripMarkdown(content).replace(/\s+/g, ' ').trim()
  if (!clean) return []

  const matcher = new RegExp(
    `(${FALLBACK_SECTION_LABELS.map(escapeRegExp).join('|')})`,
    'gi',
  )
  const matches = Array.from(clean.matchAll(matcher))
  if (matches.length === 0) return []

  return matches
    .map((match, index) => {
      const label = match[0].trim()
      const start = (match.index || 0) + match[0].length
      const end = index + 1 < matches.length ? matches[index + 1].index || clean.length : clean.length
      const body = clean.slice(start, end).trim().replace(/^[-:–—]\s*/, '')
      return body ? { label, body } : null
    })
    .filter((section): section is StructuredSection => Boolean(section))
}

function getStructuredSections(content: string): StructuredSection[] {
  const parsed = parseReportSections(content)
  if (parsed.length > 1) return parsed

  if (parsed.length === 1) {
    const fromBody = getFallbackStructuredSections(parsed[0].body)
    if (fromBody.length > 0) return fromBody
    return parsed
  }

  return getFallbackStructuredSections(content)
}

function trimSentence(value: string, maxLength = 72) {
  const clean = value.replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '')
  if (clean.length <= maxLength) return clean
  const clipped = clean.slice(0, maxLength)
  const boundary = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, boundary > 0 ? boundary : clipped.length)}…`
}

function firstSentence(value: string) {
  const sentences = stripMarkdown(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  return sentences[0] || ''
}

function getReportTitle(report: ReportRecord) {
  const sections = getStructuredSections(report.content)
  for (const key of TITLE_SECTION_KEYS) {
    const section = sections.find((candidate) => sectionKey(candidate.label) === key)
    if (section) {
      const sentence = firstSentence(section.body)
      if (sentence) return trimSentence(sentence)
    }
  }

  const firstSectionSentence = firstSentence(sections[0]?.body || '')
  if (firstSectionSentence) return trimSentence(firstSectionSentence)

  const fallback = firstSentence(report.content)
  if (fallback) return trimSentence(fallback)

  return TYPE_LABEL[report.type] || 'Report'
}

function getMinutesBetween(start: string | null, end: string | null) {
  if (!start || !end) return 0
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return 0
  return Math.round((endMs - startMs) / 60000)
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) return '0m'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h${minutes}m`
}

function getFocusMinutes(events: CalendarEventRecord[]) {
  return events.reduce((total, event) => {
    if (event.all_day || !FOCUS_EVENT_RE.test(event.title || '')) return total
    return total + getMinutesBetween(event.start_time, event.end_time)
  }, 0)
}

function buildMetrics(detail: ReportDetailState): Metric[] {
  const dueToday = detail.openTasks.filter(
    (task) => task.due_local_date === detail.report.local_date,
  ).length
  const openLoops = detail.openTasks.filter(
    (task) => task.due_local_date && task.due_local_date <= detail.report.local_date,
  ).length
  const focusMinutes = getFocusMinutes(detail.events)

  if (detail.report.type === 'morning') {
    return [
      { value: String(dueToday), label: 'Due today' },
      {
        value: focusMinutes > 0 ? formatMinutes(focusMinutes) : String(detail.events.length),
        label: focusMinutes > 0 ? 'Focus blocks' : 'Calendar blocks',
      },
      {
        value: String(openLoops || detail.entries.length),
        label: openLoops > 0 ? 'Open loops' : 'Captures',
      },
    ]
  }

  if (detail.report.type === 'weekly') {
    return [
      { value: String(detail.openTasks.length), label: 'Open tasks' },
      { value: String(detail.events.length), label: 'Calendar blocks' },
      { value: String(detail.entries.length), label: 'Captures' },
    ]
  }

  return [
    { value: String(detail.completedTasks.length), label: 'Tasks done' },
    {
      value: focusMinutes > 0 ? formatMinutes(focusMinutes) : String(detail.events.length),
      label: focusMinutes > 0 ? 'Deep work' : 'Calendar blocks',
    },
    {
      value: String(openLoops || detail.entries.length),
      label: openLoops > 0 ? 'Open loops' : 'Captures',
    },
  ]
}

function getPullQuote(detail: ReportDetailState) {
  const sections = getStructuredSections(detail.report.content)
  const section = sections.find((candidate) => PULL_QUOTE_KEYS.has(sectionKey(candidate.label)))
  if (!section) return null

  const clean = stripMarkdown(section.body)
  if (!clean) return null

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length >= 2) {
    return {
      label: section.label,
      lead: sentences.slice(0, -1).join(' ').trim(),
      accent: sentences.at(-1)?.trim() || '',
    }
  }

  return {
    label: section.label,
    lead: clean,
    accent: '',
  }
}

function getBodySections(detail: ReportDetailState) {
  return getStructuredSections(detail.report.content)
    .filter((section) => !PULL_QUOTE_KEYS.has(sectionKey(section.label)))
    .map((section) => ({
      ...section,
      key: sectionKey(section.label),
      paragraphs: stripMarkdown(section.body)
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    }))
}

function getLinkedEntries(entries: EntryRecord[]) {
  return entries
    .slice(-4)
    .reverse()
    .map((entry) => {
      const presentation = getEntryPresentation(entry)
      return {
        id: entry.id,
        content: entry.content,
        typeLabel: presentation.kind,
        typeColor: presentation.color,
      }
    })
}

export function ReportClient() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<string, ReportDetailState>>({})
  const [timezone, setTimezone] = useState('UTC')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchJson<ReportsListResponse>('/api/life/reports?all=true')
      .then((payload) => {
        if (cancelled) return
        setReports(payload.reports)
        setTimezone(payload.timezone)
        const todayEod = payload.reports.find(
          (report) => report.local_date === payload.localDate && report.type === 'eod',
        )
        setSelectedId(
          todayEod?.id ||
            payload.reports.find((report) => report.type === 'eod')?.id ||
            payload.reports[0]?.id ||
            null,
        )
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reports.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedId || detailCache[selectedId]) return

    let cancelled = false
    setDetailError(null)
    setDetailLoading(true)

    fetchJson<ReportDetailResponse>(`/api/life/reports?id=${selectedId}`)
      .then((payload) => {
        if (cancelled) return
        setTimezone(payload.timezone)
        setDetailCache((current) => ({
          ...current,
          [payload.report.id]: {
            report: payload.report,
            entries: payload.context.entries,
            events: payload.context.events,
            openTasks: payload.context.openTasks,
            completedTasks: payload.context.completedTasks,
          },
        }))
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err instanceof Error ? err.message : 'Failed to load report detail.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [detailCache, selectedId])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) || null,
    [reports, selectedId],
  )
  const selectedDetail = selectedId ? detailCache[selectedId] || null : null

  const reportTitle = useMemo(
    () => (selectedDetail ? getReportTitle(selectedDetail.report) : ''),
    [selectedDetail],
  )
  const metrics = useMemo(
    () => (selectedDetail ? buildMetrics(selectedDetail) : []),
    [selectedDetail],
  )
  const pullQuote = useMemo(
    () => (selectedDetail ? getPullQuote(selectedDetail) : null),
    [selectedDetail],
  )
  const bodySections = useMemo(
    () => (selectedDetail ? getBodySections(selectedDetail) : []),
    [selectedDetail],
  )
  const linkedEntries = useMemo(
    () => (selectedDetail ? getLinkedEntries(selectedDetail.entries) : []),
    [selectedDetail],
  )

  const isEmpty = !loading && reports.length === 0

  return (
    <div>
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Briefs &amp; reflections</h1>
        </div>
      </div>

      <div className="life-reports-shell">
        <ul className="life-reports-sidebar">
          {reports.map((report) => (
            <li key={report.id}>
              <button
                type="button"
                className={`life-reports-row ${selectedId === report.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(report.id)}
              >
                <span className="life-reports-row-date">{shortDay(report.local_date, timezone)}</span>
                <span className="life-reports-row-type">
                  {TYPE_LABEL[report.type]?.replace(' brief', '').replace(' ahead', '') || report.type}
                </span>
              </button>
            </li>
          ))}
          {reports.length === 0 ? (
            <>
              <li>
                <div className="life-reports-row life-reports-row-empty">
                  <span className="life-reports-row-date">No reports yet</span>
                  <span className="life-reports-row-type">Empty</span>
                </div>
              </li>
              <li>
                <div className="life-reports-row life-reports-row-empty">
                  <span className="life-reports-row-date">Morning brief</span>
                  <span className="life-reports-row-type">Soon</span>
                </div>
              </li>
              <li>
                <div className="life-reports-row life-reports-row-empty">
                  <span className="life-reports-row-date">Evening brief</span>
                  <span className="life-reports-row-type">Soon</span>
                </div>
              </li>
            </>
          ) : null}
        </ul>

        <article className="life-reports-reader">
          {loading ? <div className="life-reports-placeholder">Loading…</div> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {isEmpty ? (
            <div className="life-reports-empty">
              <header className="life-reports-reader-head">
                <p className="eyebrow">Reports</p>
                <h1>No reports yet</h1>
              </header>
              <section className="life-report-section">
                <p className="eyebrow">What shows up here</p>
                <p className="muted-text">
                  Morning briefs, evening reflections, and week-ahead summaries will land here as
                  you use Life.
                </p>
              </section>
              <section className="life-report-section life-report-section-accent">
                <p className="eyebrow">How to populate it</p>
                <p className="muted-text">
                  Capture entries, keep tasks current, and run through a full day or week. The
                  generated briefs will use those signals.
                </p>
              </section>
            </div>
          ) : null}
          {!loading && !selectedReport && !isEmpty ? (
            <p className="muted-text">No report selected.</p>
          ) : null}
          {detailError ? <p className="error-text">{detailError}</p> : null}
          {detailLoading && !selectedDetail ? (
            <div className="life-reports-placeholder">Loading report…</div>
          ) : null}
          {selectedDetail ? (
            <>
              <header className="life-reports-reader-head">
                <p className="eyebrow">
                  {TYPE_LABEL[selectedDetail.report.type] || selectedDetail.report.type} ·{' '}
                  <b>{shortDay(selectedDetail.report.local_date, timezone)}</b>
                </p>
                <h1>{reportTitle}</h1>
              </header>

              <div className="life-report-metrics">
                {metrics.map((metric) => (
                  <div className="life-report-metric" key={metric.label}>
                    <div className="life-report-metric-value">{metric.value}</div>
                    <div className="life-report-metric-label">{metric.label}</div>
                  </div>
                ))}
              </div>

              {pullQuote ? (
                <section className="life-report-pullquote">
                  <p className="eyebrow">{pullQuote.label}</p>
                  <p className="life-report-pullquote-text">
                    {pullQuote.lead}{' '}
                    {pullQuote.accent ? (
                      <span className="life-report-pullquote-mark">{pullQuote.accent}</span>
                    ) : null}
                  </p>
                </section>
              ) : null}

              <div className="life-report-sections">
                {bodySections.map((section) => (
                  <section
                    className={`life-report-section ${
                      section.key === 'tension' ? 'life-report-section-accent' : ''
                    }`}
                    key={`${section.key}-${section.label}`}
                  >
                    <h3>{section.label}</h3>
                    <div className="life-report-section-body">
                      {section.paragraphs.map((paragraph, index) => (
                        <p key={`${section.key}-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {linkedEntries.length > 0 ? (
                <section className="life-report-linked">
                  <h3>From your captures</h3>
                  <div className="life-report-linked-list">
                    {linkedEntries.map((entry) => (
                      <div className="life-report-linked-item" key={entry.id}>
                        <span
                          className="life-report-linked-label"
                          style={{ color: entry.typeColor }}
                        >
                          {entry.typeLabel}
                        </span>
                        <p className="life-report-linked-text">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </article>
      </div>
    </div>
  )
}
