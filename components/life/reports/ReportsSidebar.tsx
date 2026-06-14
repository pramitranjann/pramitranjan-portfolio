'use client'

import type { ReportRecord } from '@/lib/life/types'

export function ReportsSidebar({
  reports,
  selectedId,
  onSelect,
}: {
  reports: ReportRecord[]
  selectedId: string | null
  onSelect: (report: ReportRecord) => void
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
            <span className="life-reports-row-date">{report.local_date}</span>
            <span className={`life-reports-row-type type-${report.type}`}>{report.type}</span>
          </button>
        </li>
      ))}
      {reports.length === 0 ? <li className="muted-text">No reports yet.</li> : null}
    </ul>
  )
}
