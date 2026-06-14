import { redirect } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { isAdminSession } from '@/lib/admin-auth'
import { OWNER_ID } from '@/lib/life/constants'
import { getProjectLabel } from '@/lib/life/projects'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getWeeklyTaskSnapshot } from '@/lib/life/tasks'
import { addDays, getCurrentLocalDate, getDisplayDate, getWeekStart } from '@/lib/life/time'
import type { ReportRecord, SummaryRecord, TaskRecord } from '@/lib/life/types'

function groupByProject(tasks: TaskRecord[]) {
  const groups = new Map<string, TaskRecord[]>()

  for (const task of tasks) {
    const key = task.project_slug || 'unassigned'
    const list = groups.get(key) || []
    list.push(task)
    groups.set(key, list)
  }

  return Array.from(groups.entries())
}

export default async function LifeWeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/review')
  }

  const params = await searchParams
  const settings = await getOwnerSettings()
  const timezone = settings.timezone
  const today = getCurrentLocalDate(timezone)
  const defaultWeek = addDays(getWeekStart(today), -7)
  const supabase = getSupabaseAdmin()

  const { data: latestWeeklyRows } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('type', 'weekly')
    .order('local_date', { ascending: false })
    .limit(1)

  const selectedWeek = params.week || (latestWeeklyRows?.[0] as ReportRecord | undefined)?.local_date || defaultWeek
  const weekEnd = addDays(selectedWeek, 6)

  const [{ data: reviewRows }, { data: summaryRows }, { count: entryCount }, { count: eodCount }] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .eq('user_id', OWNER_ID)
      .eq('type', 'weekly')
      .eq('local_date', selectedWeek)
      .limit(1),
    supabase
      .from('summaries')
      .select('*')
      .eq('user_id', OWNER_ID)
      .eq('week_start', selectedWeek)
      .limit(1),
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', OWNER_ID)
      .gte('local_date', selectedWeek)
      .lte('local_date', weekEnd),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', OWNER_ID)
      .eq('type', 'eod')
      .gte('local_date', selectedWeek)
      .lte('local_date', weekEnd),
  ])

  const review = ((reviewRows || []) as ReportRecord[])[0] || null
  const summary = ((summaryRows || []) as SummaryRecord[])[0] || null
  const taskSnapshot = await getWeeklyTaskSnapshot(selectedWeek)
  const groupedOpenTasks = groupByProject(taskSnapshot.openTasks)

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Weekly review</p>
        <h1>{getDisplayDate(selectedWeek, timezone)} to {getDisplayDate(weekEnd, timezone)}</h1>
        <p className="hero-copy">
          Weekly review compresses the thread into project pulse, open loops, and what next week needs to protect.
        </p>

        <div className="toolbar">
          <form action="/api/life/synthesis/weekly" method="post">
            <input name="redirectTo" type="hidden" value={`/life/review?week=${selectedWeek}`} />
            <input name="weekStart" type="hidden" value={selectedWeek} />
            <input name="force" type="hidden" value="true" />
            <button className="primary-button" type="submit">
              Generate weekly review
            </button>
          </form>
        </div>
        {params.error ? <p className="error-text">{params.error}</p> : null}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <h2>Week snapshot</h2>
          <span className="count-pill">{entryCount || 0}</span>
        </div>
        <div className="detail-stack">
          <div className="metric-row">
            <strong>{entryCount || 0}</strong>
            <span className="muted-text">entries captured</span>
          </div>
          <div className="metric-row">
            <strong>{eodCount || 0}</strong>
            <span className="muted-text">daily reports generated</span>
          </div>
          <div className="metric-row">
            <strong>{taskSnapshot.completedTasks.length}</strong>
            <span className="muted-text">tasks completed that week</span>
          </div>
          <div className="metric-row">
            <strong>{taskSnapshot.openTasks.length}</strong>
            <span className="muted-text">open tasks still in play</span>
          </div>
        </div>
      </section>

      <section className="panel-card" style={{ gridColumn: '1 / -1' }}>
        <div className="section-head">
          <h2>Weekly review</h2>
          <span className="badge secondary">{review ? 'Ready' : 'Missing'}</span>
        </div>
        {review ? <MarkdownCard content={review.content} /> : <p className="muted-text">No weekly review generated for this week yet.</p>}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <h2>Compressed context</h2>
          <span className="badge secondary">{summary ? 'Saved' : 'Missing'}</span>
        </div>
        {summary ? <MarkdownCard content={summary.content} /> : <p className="muted-text">No weekly summary yet.</p>}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <h2>Open tasks by project</h2>
          <span className="count-pill">{taskSnapshot.openTasks.length}</span>
        </div>
        {groupedOpenTasks.length === 0 ? <p className="muted-text">No active tasks.</p> : null}
        <div className="report-stack">
          {groupedOpenTasks.map(([projectSlug, tasks]) => (
            <article className="subtle-card" key={projectSlug}>
              <p className="eyebrow">{projectSlug === 'unassigned' ? 'Unassigned' : getProjectLabel(projectSlug) || projectSlug}</p>
              <ul className="timeline-list">
                {tasks.map((task) => (
                  <li className="timeline-item" key={task.id}>
                    <strong>{task.title}</strong>
                    <p className="muted-text">
                      {task.priority}
                      {task.due_local_date ? ` • due ${task.due_local_date}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
