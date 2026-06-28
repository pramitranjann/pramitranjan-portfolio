'use client'

import { useMemo, useState } from 'react'

import { shortTaskCode } from '@/lib/life/receipt'
import { localDateTimeToUtc } from '@/lib/life/time'
import type { PrintJobRecord, TaskPrintInfo, TaskRecord } from '@/lib/life/types'

const PRINT_STATE_LABEL: Record<string, string> = {
  none: 'Not printed',
  pending: 'Queued',
  leased: 'Printing…',
  printed: 'Printed',
  failed: 'Failed',
}

function whenLabel(iso: string | null, timeZone: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function dueLabel(dueLocalDate: string | null, timeZone: string) {
  if (!dueLocalDate) return null
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(localDateTimeToUtc(dueLocalDate, timeZone, 12, 0))
}

function isLeaseStale(job: PrintJobRecord, now: number) {
  return job.status === 'leased' && job.lease_expires_at != null && new Date(job.lease_expires_at).getTime() < now
}

export function PrintManagement({
  tasks,
  printJobs,
  printInfo,
  timezone,
  labelFor,
  onQueueMany,
  onReprint,
  onRetry,
}: {
  tasks: TaskRecord[]
  printJobs: PrintJobRecord[]
  printInfo: Record<string, TaskPrintInfo>
  timezone: string
  labelFor: (slug: string | null) => string
  onQueueMany: (taskIds: string[]) => Promise<boolean>
  onReprint: (taskId: string) => Promise<boolean>
  onRetry: (jobId: string) => Promise<void>
}) {
  const now = Date.now()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [showDone, setShowDone] = useState(false)
  const [busy, setBusy] = useState(false)

  // Project options drawn from whatever the current tasks reference.
  const projectOptions = useMemo(() => {
    const slugs = new Set<string>()
    for (const task of tasks) if (task.project_slug) slugs.add(task.project_slug)
    return Array.from(slugs)
  }, [tasks])

  const matchesFilters = (task: TaskRecord) => {
    if (projectFilter !== 'all' && (task.project_slug || '') !== projectFilter) return false
    if (!showDone && task.status === 'done') return false
    return true
  }

  // Needs Printing: never-queued tasks with no successful receipt. Failed jobs
  // live in Needs Attention; queued/leased live in Queue.
  const needsPrinting = useMemo(
    () => tasks.filter((task) => !printInfo[task.id] && matchesFilters(task)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, printInfo, projectFilter, showDone],
  )

  const queueJobs = printJobs.filter((job) => job.status === 'pending' || (job.status === 'leased' && !isLeaseStale(job, now)))
  const printedJobs = printJobs.filter((job) => job.status === 'printed')
  const attentionJobs = printJobs.filter((job) => job.status === 'failed' || isLeaseStale(job, now))

  function toggle(taskId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) =>
      current.size === needsPrinting.length ? new Set() : new Set(needsPrinting.map((task) => task.id)),
    )
  }

  async function queueSelected() {
    const ids = needsPrinting.filter((task) => selected.has(task.id)).map((task) => task.id)
    if (!ids.length || busy) return
    setBusy(true)
    try {
      const queued = await onQueueMany(ids)
      if (queued) setSelected(new Set())
    } finally {
      setBusy(false)
    }
  }

  async function reprint(taskId: string) {
    if (busy) return
    setBusy(true)
    try {
      await onReprint(taskId)
    } finally {
      setBusy(false)
    }
  }

  async function retry(jobId: string) {
    if (busy) return
    setBusy(true)
    try {
      await onRetry(jobId)
    } finally {
      setBusy(false)
    }
  }

  const selectedCount = needsPrinting.filter((task) => selected.has(task.id)).length

  return (
    <div className="life-print-section">
      <div className="life-print-filterbar">
        <select
          className="life-print-select"
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          aria-label="Filter by project"
        >
          <option value="all">All projects</option>
          {projectOptions.map((slug) => (
            <option key={slug} value={slug}>
              {labelFor(slug)}
            </option>
          ))}
        </select>
        <label className="life-print-check-label">
          <input type="checkbox" checked={showDone} onChange={(event) => setShowDone(event.target.checked)} />
          Show completed
        </label>
      </div>

      {/* NEEDS PRINTING */}
      <section className="life-print-bucket">
        <div className="life-print-bucket-head">
          <h3>Needs Printing</h3>
          <span className="life-print-count">{needsPrinting.length}</span>
          {needsPrinting.length > 0 ? (
            <div className="life-print-bucket-actions">
              <button type="button" className="life-btn ghost" onClick={toggleAll}>
                {selected.size === needsPrinting.length ? 'Clear' : 'Select all'}
              </button>
              <button type="button" className="life-btn primary" disabled={selectedCount === 0 || busy} onClick={queueSelected}>
                Queue {selectedCount || ''} for desk
              </button>
            </div>
          ) : null}
        </div>
        {needsPrinting.length === 0 ? (
          <div className="life-empty">Nothing waiting to print.</div>
        ) : (
          <div className="life-print-rows">
            {needsPrinting.map((task) => (
              <label className="life-print-row" key={task.id}>
                <input type="checkbox" checked={selected.has(task.id)} onChange={() => toggle(task.id)} />
                <span className={`life-print-row-title${task.status === 'done' ? ' is-done' : ''}`}>{task.title}</span>
                <span className="life-print-row-meta">
                  {task.project_slug ? <span className="life-tag">{labelFor(task.project_slug)}</span> : null}
                  {dueLabel(task.due_local_date, timezone) ? (
                    <span className="life-due-chip">{dueLabel(task.due_local_date, timezone)}</span>
                  ) : null}
                  <span className="life-print-code">{shortTaskCode(task.id)}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* QUEUE */}
      <section className="life-print-bucket">
        <div className="life-print-bucket-head">
          <h3>Queue</h3>
          <span className="life-print-count">{queueJobs.length}</span>
        </div>
        {queueJobs.length === 0 ? (
          <div className="life-empty">No jobs waiting for the printer.</div>
        ) : (
          <div className="life-print-rows">
            {queueJobs.map((job) => (
              <div className="life-print-row" key={job.id}>
                <span className="life-print-row-title">{job.task_title}</span>
                <span className="life-print-row-meta">
                  <span className={`life-print-badge state-${job.status}`}>{PRINT_STATE_LABEL[job.status]}</span>
                  <span className="life-print-when">{whenLabel(job.created_at, timezone)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEEDS ATTENTION */}
      <section className="life-print-bucket">
        <div className="life-print-bucket-head">
          <h3>Needs Attention</h3>
          <span className="life-print-count">{attentionJobs.length}</span>
        </div>
        {attentionJobs.length === 0 ? (
          <div className="life-empty">No failed or stuck jobs.</div>
        ) : (
          <div className="life-print-rows">
            {attentionJobs.map((job) => {
              const stale = isLeaseStale(job, now)
              return (
                <div className="life-print-row" key={job.id}>
                  <span className="life-print-row-title">{job.task_title}</span>
                  <span className="life-print-row-meta">
                    <span className="life-print-badge state-failed">{stale ? 'Stuck' : 'Failed'}</span>
                    {job.last_error && !stale ? <span className="life-print-error">{job.last_error}</span> : null}
                    <button type="button" className="life-btn ghost" disabled={busy} onClick={() => retry(job.id)}>
                      Retry
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* PRINTED */}
      <section className="life-print-bucket">
        <div className="life-print-bucket-head">
          <h3>Printed</h3>
          <span className="life-print-count">{printedJobs.length}</span>
        </div>
        {printedJobs.length === 0 ? (
          <div className="life-empty">No receipts printed yet.</div>
        ) : (
          <div className="life-print-rows">
            {printedJobs.map((job) => (
              <div className="life-print-row" key={job.id}>
                <span className="life-print-row-title">{job.task_title}</span>
                <span className="life-print-row-meta">
                  <span className="life-print-badge state-printed">Printed</span>
                  <span className="life-print-when">{whenLabel(job.printed_at, timezone)}</span>
                  {job.task_id ? (
                    <button type="button" className="life-btn ghost" disabled={busy} onClick={() => reprint(job.task_id as string)}>
                      Reprint
                    </button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
