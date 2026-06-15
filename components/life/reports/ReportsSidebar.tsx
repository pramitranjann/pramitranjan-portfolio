'use client'

import { localDateTimeToUtc } from '@/lib/life/time'
import type { ReportRecord } from '@/lib/life/types'

const TYPE_SHORT: Record<string, string> = {
  eod: 'Evening',
  morning: 'Morning',
  weekly: 'Weekly',
}

function shortDay(localDate: string, timeZone: string) {
  const date = localDateTimeToUtc(localDate, timeZone, 12, 0)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).formatToParts(date)
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${lookup.day} ${lookup.month}`
}

export function ReportsSidebar({
  reports,
  selectedId,
  onSelect,
  timezone,
}: {
  reports: ReportRecord[]
  selectedId: string | null
  onSelect: (report: ReportRecord) => void
  timezone: string
}) {
  return (
    <ul className="life-reports-sidebar">
      {reports.map((report) => (
        <li key={report.id}>
          <button
            type="button"
            className={`life-reports-row ${selectedId === report.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(report)}
          >
            <span className="life-reports-row-date">{shortDay(report.local_date, timezone)}</span>
            <span className={`life-reports-row-type type-${report.type}`}>
              {TYPE_SHORT[report.type] || report.type}
            </span>
          </button>
        </li>
      ))}
      {reports.length === 0 ? <li className="muted-text">No reports yet.</li> : null}
    </ul>
  )
}
