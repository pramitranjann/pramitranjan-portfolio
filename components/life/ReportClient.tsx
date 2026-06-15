'use client'

import { useEffect, useMemo, useState } from 'react'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { ReportsSidebar } from '@/components/life/reports/ReportsSidebar'
import { SectionCard } from '@/components/life/reports/SectionCard'
import { fetchJson } from '@/lib/life/client'
import { parseReportSections } from '@/lib/life/markdown-sections'
import { getDisplayDate } from '@/lib/life/time'
import type { ReportRecord } from '@/lib/life/types'

interface ReportsListResponse {
  localDate: string
  timezone: string
  reports: ReportRecord[]
}

const TYPE_LABEL: Record<string, string> = {
  eod: 'Evening brief',
  morning: 'Morning brief',
  weekly: 'Week ahead',
}

export function ReportClient() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [selected, setSelected] = useState<ReportRecord | null>(null)
  const [timezone, setTimezone] = useState('UTC')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchJson<ReportsListResponse>('/api/life/reports?all=true')
      .then((payload) => {
        if (cancelled) return
        setReports(payload.reports)
        setTimezone(payload.timezone)
        const todayEod = payload.reports.find(
          (r) => r.local_date === payload.localDate && r.type === 'eod',
        )
        setSelected(
          todayEod ||
            payload.reports.find((r) => r.type === 'eod') ||
            payload.reports[0] ||
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

  const sections = useMemo(
    () => (selected ? parseReportSections(selected.content) : []),
    [selected],
  )

  return (
    <div>
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Briefs &amp; reflections</h1>
        </div>
      </div>

      <div className="life-reports-shell">
        <ReportsSidebar
          reports={reports}
          selectedId={selected?.id || null}
          onSelect={setSelected}
          timezone={timezone}
        />

        <article className="life-reports-reader">
          {loading ? <p className="muted-text">Loading…</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {!loading && !selected ? <p className="muted-text">No report selected.</p> : null}
          {selected ? (
            <>
              <header className="life-reports-reader-head">
                <p className="eyebrow">{TYPE_LABEL[selected.type] || selected.type}</p>
                <h1>{getDisplayDate(selected.local_date, timezone)}</h1>
              </header>
              {sections.length > 0 ? (
                <div className="life-reports-sections">
                  {sections.map((section, index) => (
                    <SectionCard key={`${section.label}-${index}`} section={section} />
                  ))}
                </div>
              ) : (
                <MarkdownCard content={selected.content} />
              )}
            </>
          ) : null}
        </article>
      </div>
    </div>
  )
}
